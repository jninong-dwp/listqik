import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import Stripe from "stripe";
import { Types } from "mongoose";
import { pricingUpgradeMeta } from "@/data/pricing-upgrade-meta";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { getEffectivePlanAccessForUser } from "@/lib/plan-access";
import { Listing } from "@/models/Listing";
import { PricingCheckoutSession } from "@/models/PricingCheckoutSession";
import { User } from "@/models/User";

type Body = {
  slugs?: string[];
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

function appBaseUrl(): string {
  const auth = process.env.NEXTAUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    return NextResponse.json({ ok: false, error: "STRIPE_SECRET_KEY is not configured." }, { status: 501 });
  }

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const selectedSlugs = (body.slugs ?? []).map((s) => String(s).trim()).filter(Boolean);
  if (selectedSlugs.length === 0) {
    return NextResponse.json({ ok: false, error: "Select at least one upgrade." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const effectivePlan = await getEffectivePlanAccessForUser(userId);
  if (!effectivePlan.planId) {
    return NextResponse.json(
      { ok: false, error: "No active plan found. Complete plan checkout before buying upgrades." },
      { status: 403 },
    );
  }

  const user = await User.findById(userId).lean();
  const email = session.user.email?.trim().toLowerCase() || user?.email?.trim().toLowerCase() || "";
  const fullName = session.user.name?.trim() || user?.name?.trim() || "";
  if (!email || !fullName) {
    return NextResponse.json({ ok: false, error: "Missing user contact profile for checkout." }, { status: 400 });
  }

  const validSlugs = new Set(pricingUpgradeMeta.map((u) => u.slug));
  const unknownSlug = selectedSlugs.find((slug) => !validSlugs.has(slug));
  if (unknownSlug) {
    return NextResponse.json({ ok: false, error: `Unsupported upgrade: ${unknownSlug}` }, { status: 400 });
  }

  const upgradeMap = parseStringMap(process.env.STRIPE_UPGRADE_PRICE_IDS_JSON);
  const lineItems: Array<{ price: string; quantity: number }> = [];
  for (const slug of selectedSlugs) {
    const priceId = upgradeMap[slug];
    if (!priceId) {
      return NextResponse.json(
        { ok: false, error: `Missing Stripe upgrade price mapping for '${slug}'.` },
        { status: 400 },
      );
    }
    lineItems.push({ price: priceId, quantity: 1 });
  }

  const checkoutSessionId = randomUUID();
  const base = appBaseUrl();
  if (!base) {
    return NextResponse.json({ ok: false, error: "NEXTAUTH_URL or VERCEL_URL is required." }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${base}/upgrades?checkout=success`,
    cancel_url: `${base}/upgrades?checkout=cancelled`,
    allow_promotion_codes: true,
    customer_email: email,
    client_reference_id: checkoutSessionId,
    billing_address_collection: "required",
    phone_number_collection: { enabled: true },
    metadata: {
      checkoutKind: "upgrades",
      checkoutSessionId,
      planId: effectivePlan.planId,
      planName: effectivePlan.planName || effectivePlan.planId,
      buyerName: fullName,
      buyerEmail: email,
      propertyAddress: listing.street || "",
      propertyUnit: listing.unit || "",
      propertyCity: listing.city || "",
      propertyState: listing.state || "",
      propertyZip: listing.zip || "",
      propertyCounty: listing.county || "",
      propertyType: listing.propertyType || "",
      upgradeSlugsCsv: selectedSlugs.join(","),
    },
  });

  await PricingCheckoutSession.findOneAndUpdate(
    { sessionId: checkoutSessionId },
    {
      $set: {
        purchaserEmail: email,
        planId: effectivePlan.planId,
        selectedUpgradeSlugs: selectedSlugs,
        upgradesCheckoutUrl: stripeSession.url || null,
      },
    },
    { upsert: true, new: true },
  );

  return NextResponse.json({
    ok: true,
    checkoutUrl: stripeSession.url || null,
    checkoutSessionId,
  });
}

