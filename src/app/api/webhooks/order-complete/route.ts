import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import type { OrderWebhookPayload } from "@/lib/seller-order-provision";
import { provisionSellerFromPaidOrder } from "@/lib/seller-order-provision";
import { sendSetupAccountEmail } from "@/lib/transactional-email";

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

  const provided = normalizeSecret(req);
  if (!provided || provided !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: OrderWebhookPayload;
  try {
    body = (await req.json()) as OrderWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  await connectDb();

  try {
    const result = await provisionSellerFromPaidOrder(body);
    if (result.status === "duplicate") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    let setupEmailSent = false;
    let setupEmailError: string | null = null;
    if (result.createdUser && result.setupAccountUrl) {
      const email = body.contact?.email?.trim();
      if (!email) {
        setupEmailError = "Missing buyer email for setup email.";
      } else {
        const sent = await sendSetupAccountEmail({
          to: email,
          fullName: body.contact?.fullName,
          setupAccountUrl: result.setupAccountUrl,
        });
        setupEmailSent = sent.sent;
        setupEmailError = sent.sent ? null : sent.error ?? "Setup email send failed.";
      }
    }
    return NextResponse.json({
      ok: true,
      duplicate: false,
      linkedToUser: result.linkedToUser,
      createdUser: result.createdUser,
      listingCreated: result.listingCreated,
      setupAccountUrl: result.setupAccountUrl ?? null,
      setupEmailSent,
      setupEmailError,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Provision failed.";
    const status = message.includes("required") ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
