import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import type { OrderWebhookPayload } from "@/lib/seller-order-provision";
import { provisionSellerFromPaidOrder } from "@/lib/seller-order-provision";
import { PricingCheckoutSession } from "@/models/PricingCheckoutSession";
import { dispatchPostPurchaseAccountEmail } from "@/lib/dispatch-post-purchase-account-email";

type CheckoutKind = "plan" | "upgrades";
type WebhookBody = OrderWebhookPayload & {
  checkoutSessionId?: string;
  checkoutKind?: CheckoutKind;
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

function normalizePlanId(rawPlanId: string | undefined, rawPlanName: string | undefined): string | undefined {
  const planId = rawPlanId?.trim();
  if (!planId) return undefined;

  // Expected app slugs.
  if (planId === "subsonic" || planId === "supersonic" || planId === "hypersonic") {
    return planId;
  }

  // If GHL sends product ID, map it back to app slug.
  const planProductIds = parseStringMap(process.env.GHL_PLAN_PRODUCT_IDS);
  for (const [slug, productId] of Object.entries(planProductIds)) {
    if (productId === planId) return slug;
  }

  // Fallback by plan name text.
  const name = (rawPlanName || "").toLowerCase();
  if (name.includes("subsonic")) return "subsonic";
  if (name.includes("supersonic")) return "supersonic";
  if (name.includes("hypersonic")) return "hypersonic";

  return planId;
}

async function markSessionPaid(
  sessionId: string | undefined,
  kind: CheckoutKind,
  externalOrderId: string | undefined,
  purchaserEmail?: string,
  planId?: string,
) {
  const update = {
    $set: {
      ...(kind === "plan"
        ? { planPaid: true, planExternalOrderId: externalOrderId || null }
        : { upgradesPaid: true, upgradesExternalOrderId: externalOrderId || null }),
      lastWebhookAt: new Date(),
    },
  };
  const id = sessionId?.trim();
  if (id) {
    await PricingCheckoutSession.findOneAndUpdate({ sessionId: id }, update, { new: true });
    return;
  }
  const email = purchaserEmail?.trim().toLowerCase();
  const plan = planId?.trim();
  if (!email || !plan) return;
  await PricingCheckoutSession.findOneAndUpdate(
    { purchaserEmail: email, planId: plan },
    update,
    { sort: { updatedAt: -1 }, new: true },
  );
}

function normalizeSecret(req: Request): string | null {
  const header = req.headers.get("x-webhook-secret")?.trim();
  if (header) {
    return header;
  }
  const auth = req.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

function normalizeBodySecret(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const secretCandidate =
    (body as { webhookSecret?: unknown }).webhookSecret ??
    (body as { secret?: unknown }).secret;
  if (typeof secretCandidate !== "string") return null;
  const secret = secretCandidate.trim();
  return secret || null;
}

/**
 * Call from payment / CRM automation (e.g. GHL) when an order is paid.
 *
 * Creates or links the buyer user, records an ACTIVE PlanPurchase, and optionally creates a draft
 * Listing when `property` includes address, city, state, and zip.
 *
 * **Idempotency:** send the same `externalOrderId` on retries (payment processor transaction id).
 *
 * **New buyers:** response includes `setupAccountUrl` when `NEXTAUTH_URL` is set — use this in your
 * automation email so they can choose a password (until then the account has a placeholder hash).
 */
export async function POST(req: Request) {
  const expected = process.env.ORDER_WEBHOOK_SECRET?.trim();
  if (!expected) {
    return NextResponse.json({ ok: false, error: "ORDER_WEBHOOK_SECRET is not configured." }, { status: 501 });
  }

  let body: WebhookBody;
  try {
    body = (await req.json()) as WebhookBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const provided = normalizeSecret(req) ?? normalizeBodySecret(body);
  if (!provided || provided !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  await connectDb();
  const checkoutKind: CheckoutKind = body.checkoutKind === "upgrades" ? "upgrades" : "plan";
  const externalOrderId = body.externalOrderId?.trim();
  const normalizedPlanId = normalizePlanId(body.plan?.id, body.plan?.name);
  if (normalizedPlanId) {
    body.plan = {
      ...body.plan,
      id: normalizedPlanId,
    };
  }

  try {
    if (checkoutKind === "upgrades") {
      await markSessionPaid(
        body.checkoutSessionId,
        checkoutKind,
        externalOrderId,
        body.contact?.email,
        normalizedPlanId ?? body.plan?.id,
      );
      return NextResponse.json({
        ok: true,
        duplicate: false,
        checkoutKind,
        sessionUpdated: Boolean(body.checkoutSessionId?.trim()),
      });
    }

    const result = await provisionSellerFromPaidOrder(body);
    await markSessionPaid(
      body.checkoutSessionId,
      checkoutKind,
      externalOrderId,
      body.contact?.email,
      normalizedPlanId ?? body.plan?.id,
    );
    if (result.status === "duplicate") {
      return NextResponse.json({ ok: true, duplicate: true, checkoutKind });
    }
    const email = body.contact?.email?.trim() ?? "";
    const emailResult = await dispatchPostPurchaseAccountEmail({
      email,
      fullName: body.contact?.fullName,
      provision: result,
    });
    const accountEmailType = emailResult.type;
    const accountEmailSent = emailResult.sent;
    const accountEmailError = emailResult.error;
    return NextResponse.json({
      ok: true,
      duplicate: false,
      checkoutKind,
      linkedToUser: result.linkedToUser,
      createdUser: result.createdUser,
      listingCreated: result.listingCreated,
      setupAccountUrl: result.setupAccountUrl ?? null,
      accountEmailType,
      accountEmailSent,
      accountEmailError,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Provision failed.";
    const status = message.includes("required") ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
