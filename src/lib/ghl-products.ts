import { pricingUpgradeMeta } from "@/data/pricing-upgrade-meta";
import { staticWizardUpgrades } from "@/data/pricing-static-upgrades";
import { createGhlClient } from "@/lib/ghl-client";
import type { WizardUpgrade } from "@/types/pricing-wizard";

type GhlClient = NonNullable<ReturnType<typeof createGhlClient>>;

function parseJsonRecord(raw: string | undefined): Record<string, string> | null {
  if (!raw?.trim()) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string" && val.trim()) out[k] = val.trim();
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

function parseIdList(raw: string | undefined): string[] | null {
  if (!raw?.trim()) return null;
  const ids = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length ? ids : null;
}

async function firstPriceAmount(
  ghl: GhlClient,
  productId: string,
  locationId: string,
): Promise<number | null> {
  try {
    const res = await ghl.products.listPricesForProduct(
      { productId, locationId, limit: 10, offset: 0 },
      { preferredTokenType: "location" },
    );
    const first = res.prices?.[0];
    if (!first || typeof first.amount !== "number") return null;
    return first.amount;
  } catch {
    return null;
  }
}

const ALL_PLANS = ["subsonic", "supersonic", "hypersonic"] as const;

function staticPriceBySlug(slug: string): number {
  const row = staticWizardUpgrades.find((u) => u.slug === slug);
  return row?.price ?? 0;
}

/** Fallback when GHL is not configured or request fails (matches previous hardcoded values). */
export function getStaticFallbackUpgrades(): WizardUpgrade[] {
  return staticWizardUpgrades.map((u) => ({
    ...u,
    recommendedFor: [...u.recommendedFor],
  }));
}

async function mapWithPrices(
  ghl: GhlClient,
  locationId: string,
  items: WizardUpgrade[],
): Promise<WizardUpgrade[]> {
  const out = await Promise.all(
    items.map(async (u) => {
      let price = await firstPriceAmount(ghl, u.ghlProductId, locationId);
      if (price == null) price = u.price;
      return { ...u, price: Math.round(price * 100) / 100 };
    }),
  );
  return out;
}

/**
 * Load upgrades from GHL when `GHL_PRIVATE_INTEGRATION_TOKEN` + `GHL_LOCATION_ID` are set.
 *
 * - **`GHL_UPGRADE_PRODUCT_IDS`** (JSON): `{ "pro-photography": "<ghlProductId>", ... }` — merges GHL names with local slugs/descriptions/recommended.
 * - Otherwise: lists products (`includedInStore: true`), optionally filtered by **`GHL_UPGRADE_PRODUCT_IDS_LIST`** (comma-separated product IDs).
 */
export async function loadWizardUpgrades(): Promise<{
  source: "ghl" | "static";
  upgrades: WizardUpgrade[];
  warning?: string;
}> {
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  const ghl = createGhlClient();

  if (!ghl || !locationId) {
    return { source: "static", upgrades: getStaticFallbackUpgrades() };
  }

  const slugToProductId = parseJsonRecord(process.env.GHL_UPGRADE_PRODUCT_IDS);

  try {
    if (slugToProductId && Object.keys(slugToProductId).length > 0) {
      const productIds = [...new Set(Object.values(slugToProductId))];
      const list = await ghl.products.listInvoices(
        {
          locationId,
          limit: 100,
          offset: 0,
          productIds,
        },
        { preferredTokenType: "location" },
      );

      const byId = new Map((list.products ?? []).map((p) => [p._id, p]));
      const base: WizardUpgrade[] = [];

      for (const meta of pricingUpgradeMeta) {
        const pid = slugToProductId[meta.slug];
        if (!pid) continue;
        const p = byId.get(pid);
        const desc =
          (p as { description?: string } | undefined)?.description?.trim() || meta.description;

        base.push({
          slug: meta.slug,
          name: p?.name?.trim() || meta.name,
          description: desc,
          toggleAddLabel: meta.toggleAddLabel,
          toggleRemoveLabel: meta.toggleRemoveLabel,
          recommendedFor: [...meta.recommendedFor],
          ghlProductId: pid,
          price: staticPriceBySlug(meta.slug),
        });
      }

      if (base.length === 0) {
        return {
          source: "static",
          upgrades: getStaticFallbackUpgrades(),
          warning: "No upgrades matched GHL_UPGRADE_PRODUCT_IDS. Check product IDs.",
        };
      }

      const upgrades = await mapWithPrices(ghl, locationId, base);
      return { source: "ghl", upgrades };
    }

    const list = await ghl.products.listInvoices(
      {
        locationId,
        limit: 100,
        offset: 0,
        includedInStore: true,
      },
      { preferredTokenType: "location" },
    );

    let products = list.products ?? [];
    const filterIds = parseIdList(process.env.GHL_UPGRADE_PRODUCT_IDS_LIST);
    if (filterIds?.length) {
      const allow = new Set(filterIds);
      products = products.filter((p) => allow.has(p._id));
    }

    const base: WizardUpgrade[] = products.map((p) => {
      const desc = (p as { description?: string }).description?.trim() || "";
      const meta = pricingUpgradeMeta.find(
        (m) => m.name.trim().toLowerCase() === p.name.trim().toLowerCase(),
      );
      return {
        slug: (p as { slug?: string }).slug?.trim() || p._id,
        name: p.name,
        description: desc,
        toggleAddLabel: meta?.toggleAddLabel || `Add ${p.name}`,
        toggleRemoveLabel: meta?.toggleRemoveLabel || `Remove ${p.name}`,
        recommendedFor: meta ? [...meta.recommendedFor] : [...ALL_PLANS],
        ghlProductId: p._id,
        price: 0,
      };
    });

    if (base.length === 0) {
      return {
        source: "static",
        upgrades: getStaticFallbackUpgrades(),
        warning: "No GHL store products returned; using static list.",
      };
    }

    const upgrades = await mapWithPrices(ghl, locationId, base);
    return { source: "ghl", upgrades };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "GHL products error";
    return {
      source: "static",
      upgrades: getStaticFallbackUpgrades(),
      warning: msg,
    };
  }
}
