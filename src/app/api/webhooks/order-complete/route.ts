import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { PlanPurchase } from "@/models/PlanPurchase";
import { User } from "@/models/User";

type Payload = {
  contact?: { email?: string };
  plan?: { id?: string; name?: string };
};

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
 * Call this endpoint from your payment / CRM automation (e.g. GHL) when an order is paid.
 * If the buyer already has an account, the plan is attached immediately; otherwise it waits
 * for registration with the same email.
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

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const email = body.contact?.email?.toLowerCase().trim();
  const planId = body.plan?.id?.trim();
  const planName = body.plan?.name?.trim() ?? planId;

  if (!email || !planId) {
    return NextResponse.json({ ok: false, error: "contact.email and plan.id are required." }, { status: 400 });
  }

  await connectDb();
  const user = await User.findOne({ email }).lean();

  await PlanPurchase.create({
    purchaserEmail: email,
    userId: user?._id ?? null,
    planId,
    planName: planName || planId,
    status: user ? "ACTIVE" : "PENDING_CLAIM",
    claimedAt: user ? new Date() : null,
  });

  return NextResponse.json({ ok: true, linkedToUser: Boolean(user) });
}
