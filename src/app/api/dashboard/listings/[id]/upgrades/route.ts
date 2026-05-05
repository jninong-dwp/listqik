import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { pricingUpgradeMeta } from "@/data/pricing-upgrade-meta";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { getEffectivePlanAccessForUser } from "@/lib/plan-access";
import { Listing } from "@/models/Listing";
import { ListingUpgradeRequest } from "@/models/ListingUpgradeRequest";

type Body = {
  slug?: string;
  amount?: number;
  requestNote?: string;
};

function resolveUpgradeName(slug: string): string | null {
  return pricingUpgradeMeta.find((item) => item.slug === slug)?.name ?? null;
}

function serialize(request: {
  _id: Types.ObjectId;
  slug: string;
  upgradeName: string;
  amount: number;
  status: string;
  requestNote?: string | null;
  reconciliationRef?: string | null;
  statusNote?: string | null;
  statusUpdatedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}) {
  return {
    id: request._id.toString(),
    slug: request.slug,
    upgradeName: request.upgradeName,
    amount: request.amount,
    status: request.status,
    requestNote: request.requestNote ?? "",
    reconciliationRef: request.reconciliationRef ?? "",
    statusNote: request.statusNote ?? "",
    statusUpdatedAt: request.statusUpdatedAt ? request.statusUpdatedAt.toISOString() : null,
    createdAt: request.createdAt ? request.createdAt.toISOString() : null,
    updatedAt: request.updatedAt ? request.updatedAt.toISOString() : null,
  };
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const effectivePlan = await getEffectivePlanAccessForUser(userId);
  if (!effectivePlan.entitlements.hasActivePlan) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No active plan found on this account. Complete checkout first, then request upgrades.",
      },
      { status: 403 },
    );
  }
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const requests = await ListingUpgradeRequest.find({ listingId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, requests: requests.map((request) => serialize(request)) });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
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

  const slug = String(body.slug ?? "").trim();
  const amount = Number(body.amount);
  const requestNote = String(body.requestNote ?? "").trim();
  const upgradeName = resolveUpgradeName(slug);

  if (!slug || !upgradeName || !Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ ok: false, error: "slug and valid amount are required." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const request = await ListingUpgradeRequest.create({
    listingId: id,
    slug,
    upgradeName,
    amount,
    requestNote,
    status: "REQUESTED",
    statusUpdatedAt: new Date(),
  });

  return NextResponse.json({
    ok: true,
    request: serialize(request),
    notification: `Upgrade request submitted: ${upgradeName}.`,
  });
}
