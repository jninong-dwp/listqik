import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDb } from "@/lib/mongodb";
import { PricingCheckoutSession } from "@/models/PricingCheckoutSession";
import {
  isStartNowSubsonicPromo,
  resolveSubsonicLandingCheckoutDiscounts,
  type SubsonicLandingCheckoutDiscount,
} from "@/lib/stripe-subsonic-landing-promo";

type CheckoutPayload = {
  source?: string;
  embedded?: boolean;
  promoSource?: string;
  checkoutSessionId?: string;
  checkoutKind?: "plan" | "upgrades";
  plan?: {
    id?: string;
    name?: string;
    price?: string;
    closeFee?: string;
  };
  contact?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  property?: {
    address?: string;
    unit?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
    propertyType?: string;
  };
  upgrades?: Array<{
    slug?: string;
    name?: string;
    price?: number;
  }>;
};

function appBaseUrl(): string {
  const auth = process.env.NEXTAUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
}

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

function parseUsdAmount(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function compact(input: string | undefined): string {
  return (input ?? "").trim();
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    return NextResponse.json({ ok: false, error: "STRIPE_SECRET_KEY is not configured." }, { status: 501 });
  }

  let body: CheckoutPayload;
  try {
    body = (await req.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const checkoutSessionId = compact(body.checkoutSessionId);
  const embedded = Boolean(body.embedded);
  const checkoutKind: "plan" | "upgrades" = body.checkoutKind === "upgrades" ? "upgrades" : "plan";
  const planSlug = compact(body.plan?.id);
  const planName = compact(body.plan?.name);
  const planPrice = parseUsdAmount(body.plan?.price);
  const email = compact(body.contact?.email).toLowerCase();
  const fullName = compact(body.contact?.fullName);
  const phone = compact(body.contact?.phone);

  if (!checkoutSessionId || !planSlug || !email || !fullName) {
    return NextResponse.json(
      { ok: false, error: "checkoutSessionId, plan.id, contact.fullName, and contact.email are required." },
      { status: 400 },
    );
  }

  const planMap = parseStringMap(process.env.STRIPE_PLAN_PRICE_IDS_JSON);
  const upgradeMap = parseStringMap(process.env.STRIPE_UPGRADE_PRICE_IDS_JSON);
  const stripe = new Stripe(key);

  const selectedUpgrades = (body.upgrades ?? [])
    .map((u) => ({ slug: compact(u.slug), name: compact(u.name), price: u.price }))
    .filter((u) => Boolean(u.slug));

  const selectedUpgradeSlugs = selectedUpgrades.map((u) => u.slug);
  const lineItems: Array<{ price: string; quantity: number }> = [];

  if (checkoutKind === "plan") {
    const planPriceId = planMap[planSlug];
    if (!planPriceId) {
      return NextResponse.json(
        { ok: false, error: `Missing Stripe plan price mapping for '${planSlug}'.` },
        { status: 400 },
      );
    }
    lineItems.push({ price: planPriceId, quantity: 1 });
  } else {
    for (const row of selectedUpgrades) {
      const priceId = upgradeMap[row.slug];
      if (!priceId) {
        return NextResponse.json(
          { ok: false, error: `Missing Stripe upgrade price mapping for '${row.slug}'.` },
          { status: 400 },
        );
      }
      lineItems.push({ price: priceId, quantity: 1 });
    }
    if (lineItems.length === 0) {
      return NextResponse.json({ ok: false, error: "Select at least one upgrade." }, { status: 400 });
    }
  }

  const base = appBaseUrl();
  if (!base) {
    return NextResponse.json({ ok: false, error: "NEXTAUTH_URL or VERCEL_URL is required." }, { status: 500 });
  }

  const promoSource = compact(body.promoSource);
  const applyStartNowSubsonicDiscount =
    checkoutKind === "plan" &&
    planSlug === "subsonic" &&
    isStartNowSubsonicPromo(promoSource);

  let landingDiscounts: SubsonicLandingCheckoutDiscount[] | undefined;
  if (applyStartNowSubsonicDiscount) {
    landingDiscounts = await resolveSubsonicLandingCheckoutDiscounts(stripe);
    if (!landingDiscounts?.length) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Landing Subsonic discount is not configured. Run npm run stripe:startnow-subsonic-promo and set STRIPE_SUBSONIC_LANDING_PROMOTION_CODE_ID (or promo/coupon env vars).",
        },
        { status: 503 },
      );
    }
  }

  const metadata: Record<string, string> = {
    checkoutKind,
    checkoutSessionId,
    planId: planSlug,
    planName,
    planPrice: body.plan?.price?.trim() || "",
    closeFee: body.plan?.closeFee?.trim() || "",
    buyerName: fullName,
    buyerEmail: email,
    buyerPhone: phone,
    propertyAddress: compact(body.property?.address),
    propertyUnit: compact(body.property?.unit),
    propertyCity: compact(body.property?.city),
    propertyState: compact(body.property?.state),
    propertyZip: compact(body.property?.zip),
    propertyCounty: compact(body.property?.county),
    propertyType: compact(body.property?.propertyType),
    upgradeSlugsCsv: selectedUpgradeSlugs.join(","),
    ...(applyStartNowSubsonicDiscount ? { promoSource: "start-now" } : {}),
  };

  const discountParams = landingDiscounts
    ? { discounts: landingDiscounts, allow_promotion_codes: false as const }
    : { allow_promotion_codes: true as const };

  /** Plan checkout charges in USD so manual promotion codes validate reliably. */
  const planAdaptivePricingParams =
    checkoutKind === "plan" ? { adaptive_pricing: { enabled: false as const } } : {};

  let session: Stripe.Checkout.Session;
  if (embedded) {
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode: "embedded_page",
        redirect_on_completion: "if_required",
        payment_method_types: ["card"],
        line_items: lineItems,
        return_url: `${base}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        ...discountParams,
        ...planAdaptivePricingParams,
        customer_email: email,
        client_reference_id: checkoutSessionId,
        metadata,
        billing_address_collection: "required",
        phone_number_collection: { enabled: true },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Embedded checkout creation failed.";
      return NextResponse.json(
        { ok: false, error: message },
        { status: 400 },
      );
    }
  } else {
    session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${base}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/pricing?checkout=cancelled`,
        ...discountParams,
        ...planAdaptivePricingParams,
        customer_email: email,
        client_reference_id: checkoutSessionId,
        metadata,
        billing_address_collection: "required",
        phone_number_collection: { enabled: true },
      });
  }

  await connectDb();
  await PricingCheckoutSession.findOneAndUpdate(
    { sessionId: checkoutSessionId },
    {
      $set: {
        purchaserEmail: email,
        planId: planSlug,
        selectedUpgradeSlugs,
        ...(checkoutKind === "plan"
          ? { planCheckoutUrl: session.url || null }
          : { upgradesCheckoutUrl: session.url || null }),
      },
    },
    { upsert: true, new: true },
  );

  return NextResponse.json({
    ok: true,
    checkoutKind,
    checkoutSessionId,
    mode: "stripe-checkout",
    checkoutUrl: session.url || null,
    checkoutClientSecret: session.client_secret || null,
    warning: checkoutKind === "plan" && planPrice == null ? "Plan amount was not parsed from plan.price." : "",
  });
}
