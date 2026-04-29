import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingUpgradeRequest } from "@/models/ListingUpgradeRequest";

const upgradeStatuses = ["REQUESTED", "IN_REVIEW", "APPROVED", "FULFILLED", "DECLINED", "CANCELLED"] as const;
type UpgradeStatus = (typeof upgradeStatuses)[number];

type PatchBody = {
  status?: string;
  statusNote?: string;
  reconciliationRef?: string;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; requestId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id, requestId } = await ctx.params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(requestId)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const status = String(body.status ?? "").trim().toUpperCase();
  const statusNote = String(body.statusNote ?? "").trim();
  const reconciliationRef = String(body.reconciliationRef ?? "").trim();
  if (!upgradeStatuses.includes(status as UpgradeStatus)) {
    return NextResponse.json({ ok: false, error: "Invalid upgrade status." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const requestDoc = await ListingUpgradeRequest.findOne({ _id: requestId, listingId: id });
  if (!requestDoc) {
    return NextResponse.json({ ok: false, error: "Upgrade request not found." }, { status: 404 });
  }

  requestDoc.status = status as UpgradeStatus;
  requestDoc.statusNote = statusNote;
  requestDoc.reconciliationRef = reconciliationRef;
  requestDoc.statusUpdatedAt = new Date();
  await requestDoc.save();

  return NextResponse.json({
    ok: true,
    notification: `Upgrade "${requestDoc.upgradeName}" is now ${requestDoc.status}.`,
  });
}
