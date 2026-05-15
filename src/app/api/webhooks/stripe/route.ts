import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Types } from "mongoose";
import { connectDb } from "@/lib/mongodb";
import { provisionSellerFromPaidOrder } from "@/lib/seller-order-provision";
import { extractStripeCheckoutCouponCode } from "@/lib/stripe-purchase-details";
import { dispatchUpgradePurchaseEmails } from "@/lib/dispatch-upgrade-purchase-emails";
import { sendExistingAccountAccessEmail, sendSetupAccountEmail } from "@/lib/transactional-email";
import { PricingCheckoutSession } from "@/models/PricingCheckoutSession";
import { UpgradePurchase } from "@/models/UpgradePurchase";
import { User } from "@/models/User";

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

function toNumCentsToDollars(cents: number | null | undefined): number | null {
  if (typeof cents !== "number" || !Number.isFinite(cents)) return null;
  return Math.round(cents) / 100;
}

function appBaseUrl(): string {
  const auth = process.env.NEXTAUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
}

async function markSessionPaid(
  sessionId: string,
  kind: "plan" | "upgrades",
  externalOrderId: string,
) {
  await PricingCheckoutSession.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        ...(kind === "plan"
          ? { planPaid: true, planExternalOrderId: externalOrderId }
          : { upgradesPaid: true, upgradesExternalOrderId: externalOrderId }),
        lastWebhookAt: new Date(),
      },
    },
    { new: true },
  );
}

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!key || !webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are required." },
      { status: 501 },
    );
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false, error: "Missing stripe-signature header." }, { status: 400 });
  }

  const stripe = new Stripe(key);
  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ ok: true, ignored: true, event: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata ?? {};
  const checkoutKind: "plan" | "upgrades" = metadata.checkoutKind === "upgrades" ? "upgrades" : "plan";
  const checkoutSessionId = (metadata.checkoutSessionId || session.client_reference_id || "").trim();
  if (!checkoutSessionId) {
    return NextResponse.json({ ok: false, error: "Missing checkoutSessionId metadata." }, { status: 400 });
  }

  await connectDb();

  const externalOrderId = session.id;
  await markSessionPaid(checkoutSessionId, checkoutKind, externalOrderId);

  if (checkoutKind === "plan") {
    const paidOrder = await provisionSellerFromPaidOrder({
      externalOrderId,
      contact: {
        email: metadata.buyerEmail || session.customer_details?.email || undefined,
        fullName: metadata.buyerName || session.customer_details?.name || undefined,
        phone: metadata.buyerPhone || session.customer_details?.phone || undefined,
      },
      plan: {
        id: metadata.planId || undefined,
        name: metadata.planName || undefined,
        price: metadata.planPrice || undefined,
        closeFee: metadata.closeFee || undefined,
      },
      property: {
        address: metadata.propertyAddress || undefined,
        unit: metadata.propertyUnit || undefined,
        city: metadata.propertyCity || undefined,
        state: metadata.propertyState || undefined,
        zip: metadata.propertyZip || undefined,
        county: metadata.propertyCounty || undefined,
        propertyType: metadata.propertyType || undefined,
      },
      upgrades: [],
      payment: {
        currency: session.currency || null,
        amountTotal: toNumCentsToDollars(session.amount_total),
        paymentStatus: session.payment_status || null,
        couponCode: extractStripeCheckoutCouponCode(session),
      },
    });

    let accountEmailSent = false;
    let accountEmailError: string | null = null;
    let accountEmailType: "setup" | "existing-login" | null = null;
    const email = (metadata.buyerEmail || session.customer_details?.email || "").trim();

    if (!email) {
      accountEmailError = "Missing buyer email for account access email.";
    } else if (paidOrder.status !== "duplicate" && paidOrder.createdUser && paidOrder.setupAccountUrl) {
      accountEmailType = "setup";
      const sent = await sendSetupAccountEmail({
        to: email,
        fullName: metadata.buyerName || session.customer_details?.name || undefined,
        setupAccountUrl: paidOrder.setupAccountUrl,
        firstLoginPath: "/dashboard",
      });
      accountEmailSent = sent.sent;
      accountEmailError = sent.sent ? null : sent.error ?? "Setup email send failed.";
    } else {
      accountEmailType = "existing-login";
      const base = appBaseUrl();
      if (!base) {
        accountEmailError = "App base URL is not configured for login email.";
      } else {
        const loginUrl = `${base}/login?callbackUrl=${encodeURIComponent("/dashboard")}`;
        const sent = await sendExistingAccountAccessEmail({
          to: email,
          fullName: metadata.buyerName || session.customer_details?.name || undefined,
          loginUrl,
        });
        accountEmailSent = sent.sent;
        accountEmailError = sent.sent ? null : sent.error ?? "Existing-account email send failed.";
      }
    }

    return NextResponse.json({
      ok: true,
      event: event.type,
      checkoutKind,
      checkoutSessionId,
      externalOrderId,
      duplicate: paidOrder.status === "duplicate",
      accountEmailType,
      accountEmailSent,
      accountEmailError,
    });
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  const upgradePriceMap = parseStringMap(process.env.STRIPE_UPGRADE_PRICE_IDS_JSON);
  const reverse = new Map<string, string>();
  for (const [slug, priceId] of Object.entries(upgradePriceMap)) {
    reverse.set(priceId, slug);
  }

  const upgradeSlugs = lineItems.data
    .map((row) => row.price?.id || "")
    .map((priceId) => reverse.get(priceId) || "")
    .filter(Boolean);

  if (upgradeSlugs.length > 0) {
    const externalUserId = (metadata.externalUserId || "").trim();
    const buyerEmail = (metadata.buyerEmail || session.customer_details?.email || "").trim().toLowerCase();
    if (externalUserId && Types.ObjectId.isValid(externalUserId)) {
      await User.updateOne(
        { _id: externalUserId },
        { $addToSet: { purchasedUpgradeSlugs: { $each: upgradeSlugs } } },
      );
    } else if (buyerEmail) {
      await User.updateOne(
        { email: buyerEmail },
        { $addToSet: { purchasedUpgradeSlugs: { $each: upgradeSlugs } } },
      );
    }
  }

  const existing = await UpgradePurchase.findOne({ externalOrderId }).select("_id").lean();
  if (!existing?._id) {
    await UpgradePurchase.create({
      purchaserEmail: metadata.buyerEmail || session.customer_details?.email || null,
      externalUserId: metadata.externalUserId || null,
      checkoutSessionId,
      externalOrderId,
      paymentStatus: session.payment_status || null,
      currency: session.currency || null,
      amountTotal: toNumCentsToDollars(session.amount_total),
      purchasedAt: new Date(),
      upgradeSlugs,
      items: lineItems.data.map((row) => ({
        name: row.description || "",
        slug: reverse.get(row.price?.id || "") || "",
        priceId: row.price?.id || "",
        productId: typeof row.price?.product === "string" ? row.price.product : "",
        quantity: row.quantity || 1,
        amount: toNumCentsToDollars(row.amount_total),
        raw: row,
      })),
      rawPayload: session,
    });

    void (async () => {
      try {
        const purchaserEmail = (
          metadata.buyerEmail ||
          session.customer_details?.email ||
          ""
        )
          .trim()
          .toLowerCase();
        if (!purchaserEmail || upgradeSlugs.length === 0) return;

        let purchaserName = metadata.buyerName || session.customer_details?.name || null;
        const externalUserId = (metadata.externalUserId || "").trim();
        if (externalUserId && Types.ObjectId.isValid(externalUserId)) {
          const user = await User.findById(externalUserId).select("name").lean();
          if (user?.name) purchaserName = user.name;
        } else if (purchaserEmail) {
          const user = await User.findOne({ email: purchaserEmail }).select("name").lean();
          if (user?.name) purchaserName = user.name;
        }

        await dispatchUpgradePurchaseEmails({
          purchaserEmail,
          purchaserName,
          upgradeSlugs,
          amountTotal: toNumCentsToDollars(session.amount_total),
          orderRef: externalOrderId,
        });
      } catch (err) {
        console.error(
          "[stripe-webhook] upgrade purchase email failed:",
          err instanceof Error ? err.message : err,
        );
      }
    })();
  }

  return NextResponse.json({
    ok: true,
    event: event.type,
    checkoutKind,
    checkoutSessionId,
    externalOrderId,
    upgradesCount: upgradeSlugs.length,
    upgrades: upgradeSlugs,
  });
}
