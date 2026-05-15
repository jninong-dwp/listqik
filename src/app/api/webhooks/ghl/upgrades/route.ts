import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDb } from "@/lib/mongodb";
import { PricingCheckoutSession } from "@/models/PricingCheckoutSession";
import { dispatchUpgradePurchaseEmails } from "@/lib/dispatch-upgrade-purchase-emails";
import { UpgradePurchase } from "@/models/UpgradePurchase";
import { User } from "@/models/User";

type UnknownRecord = Record<string, unknown>;

type UpgradeWebhookBody = {
  event?: string;
  source?: string;
  location_id?: string;
  contact_id?: string;
  contact_email?: string;
  external_user_id?: string;
  checkout_session_id?: string;
  order_id?: string;
  order_number?: string;
  payment_status?: string;
  currency?: string;
  amount_total?: number | string;
  items?: unknown;
  created_at?: string;
};

type ParsedItem = {
  name: string;
  slug: string;
  priceId: string;
  productId: string;
  quantity: number;
  amount: number | null;
  raw: unknown;
};

function parseStringMap(raw: string | undefined): Record<string, string> {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) out[key.trim()] = value.trim();
    }
    return out;
  } catch {
    return {};
  }
}

function normalizeSecret(req: Request): string | null {
  const header = req.headers.get("x-webhook-secret")?.trim();
  if (header) return header;
  const auth = req.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeItems(rawItems: unknown): ParsedItem[] {
  let candidate: unknown = rawItems;
  if (typeof rawItems === "string") {
    const trimmed = rawItems.trim();
    if (!trimmed) return [];
    try {
      candidate = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(candidate)) return [];

  return candidate.map((raw): ParsedItem => {
    const obj = asRecord(raw) ?? {};
    const name =
      String(
        obj.name ??
          obj.title ??
          obj.productName ??
          obj.product_name ??
          obj.label ??
          "",
      ).trim();
    const slug = String(obj.slug ?? obj.code ?? obj.sku ?? "").trim().toLowerCase();
    const priceId = String(obj.priceId ?? obj.price_id ?? obj.id ?? "").trim();
    const productId = String(obj.productId ?? obj.product_id ?? obj._id ?? "").trim();
    const quantity = Math.max(1, Math.round(toNumber(obj.qty ?? obj.quantity) ?? 1));
    const amount = toNumber(obj.amount ?? obj.price ?? obj.unit_price);
    return {
      name,
      slug,
      priceId,
      productId,
      quantity,
      amount,
      raw,
    };
  });
}

function resolveUpgradeSlugs(items: ParsedItem[]): string[] {
  const mappedPriceIds = parseStringMap(process.env.GHL_UPGRADE_PRICE_IDS);
  const reverseMap = new Map<string, string>();
  for (const [slug, priceId] of Object.entries(mappedPriceIds)) {
    reverseMap.set(priceId, slug);
  }

  const out = new Set<string>();
  for (const item of items) {
    const mapped = item.priceId ? reverseMap.get(item.priceId) : undefined;
    if (mapped) {
      out.add(mapped);
      continue;
    }
    if (item.slug) out.add(item.slug);
  }
  return [...out];
}

async function resolveUserId(externalUserId: string | undefined, contactEmail: string | undefined) {
  const ext = externalUserId?.trim();
  if (ext && Types.ObjectId.isValid(ext)) {
    const byId = await User.findById(ext).select("_id").lean();
    if (byId?._id) return byId._id;
  }

  const email = contactEmail?.trim().toLowerCase();
  if (!email) return null;
  const byEmail = await User.findOne({ email }).select("_id").lean();
  return byEmail?._id ?? null;
}

export async function POST(req: Request) {
  const expected = process.env.ORDER_WEBHOOK_SECRET?.trim();
  if (!expected) {
    return NextResponse.json({ ok: false, error: "ORDER_WEBHOOK_SECRET is not configured." }, { status: 501 });
  }

  const provided = normalizeSecret(req);
  if (!provided || provided !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: UpgradeWebhookBody;
  try {
    body = (await req.json()) as UpgradeWebhookBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const externalOrderId = body.order_id?.trim() || body.order_number?.trim() || null;
  const checkoutSessionId = body.checkout_session_id?.trim() || null;
  const externalUserId = body.external_user_id?.trim() || null;
  const contactId = body.contact_id?.trim() || null;
  const contactEmail = body.contact_email?.trim().toLowerCase() || null;
  const paymentStatus = body.payment_status?.trim() || null;
  const isPaid = !paymentStatus || /paid|succeeded|success|completed/i.test(paymentStatus);

  if (!externalOrderId && !checkoutSessionId) {
    return NextResponse.json(
      { ok: false, error: "order_id or checkout_session_id is required for idempotency." },
      { status: 400 },
    );
  }

  if (!isPaid) {
    return NextResponse.json({ ok: true, ignored: true, reason: "Payment is not marked paid." });
  }

  await connectDb();

  if (externalOrderId) {
    const existing = await UpgradePurchase.findOne({ externalOrderId }).select("_id").lean();
    if (existing?._id) {
      return NextResponse.json({ ok: true, duplicate: true, externalOrderId });
    }
  }

  const items = normalizeItems(body.items);
  const resolvedUpgradeSlugs = resolveUpgradeSlugs(items);
  const resolvedUserId = await resolveUserId(externalUserId ?? undefined, contactEmail ?? undefined);
  const amountTotal = toNumber(body.amount_total);

  if (resolvedUpgradeSlugs.length > 0) {
    if (resolvedUserId) {
      await User.updateOne(
        { _id: resolvedUserId },
        { $addToSet: { purchasedUpgradeSlugs: { $each: resolvedUpgradeSlugs } } },
      );
    } else if (contactEmail) {
      await User.updateOne(
        { email: contactEmail },
        { $addToSet: { purchasedUpgradeSlugs: { $each: resolvedUpgradeSlugs } } },
      );
    }
  }

  const purchaseDoc = await UpgradePurchase.create({
    purchaserEmail: contactEmail,
    userId: resolvedUserId,
    externalUserId,
    checkoutSessionId,
    contactId,
    externalOrderId,
    paymentStatus,
    locationId: body.location_id?.trim() || null,
    currency: body.currency?.trim() || null,
    amountTotal,
    purchasedAt: body.created_at ? new Date(body.created_at) : new Date(),
    upgradeSlugs: resolvedUpgradeSlugs,
    items,
    rawPayload: body,
  });

  if (checkoutSessionId) {
    await PricingCheckoutSession.findOneAndUpdate(
      { sessionId: checkoutSessionId },
      {
        $set: {
          upgradesPaid: true,
          upgradesExternalOrderId: externalOrderId,
          lastWebhookAt: new Date(),
        },
      },
      { new: true },
    );
  }

  if (contactEmail && resolvedUpgradeSlugs.length > 0) {
    void (async () => {
      try {
        let purchaserName: string | null = null;
        if (resolvedUserId) {
          const user = await User.findById(resolvedUserId).select("name").lean();
          purchaserName = user?.name ?? null;
        }
        await dispatchUpgradePurchaseEmails({
          purchaserEmail: contactEmail,
          purchaserName,
          upgradeSlugs: resolvedUpgradeSlugs,
          amountTotal,
          orderRef: externalOrderId,
        });
      } catch (err) {
        console.error(
          "[ghl-upgrades-webhook] upgrade purchase email failed:",
          err instanceof Error ? err.message : err,
        );
      }
    })();
  }

  return NextResponse.json({
    ok: true,
    duplicate: false,
    purchaseId: purchaseDoc._id.toString(),
    externalOrderId,
    checkoutSessionId,
    resolvedUserId: resolvedUserId ? String(resolvedUserId) : null,
    upgradesCount: resolvedUpgradeSlugs.length,
    upgrades: resolvedUpgradeSlugs,
  });
}
