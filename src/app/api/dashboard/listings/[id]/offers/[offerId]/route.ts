import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingOffer } from "@/models/ListingOffer";

const offerStatuses = ["RECEIVED", "REVIEWING", "COUNTERED", "ACCEPTED", "DECLINED", "WITHDRAWN"] as const;
type OfferStatus = (typeof offerStatuses)[number];

type PatchBody = {
  status?: string;
  statusNote?: string;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; offerId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id, offerId } = await ctx.params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(offerId)) {
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
  if (!offerStatuses.includes(status as OfferStatus)) {
    return NextResponse.json({ ok: false, error: "Invalid offer status." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const offer = await ListingOffer.findOne({ _id: offerId, listingId: id });
  if (!offer) {
    return NextResponse.json({ ok: false, error: "Offer not found." }, { status: 404 });
  }

  offer.status = status as OfferStatus;
  offer.statusNote = statusNote;
  offer.statusUpdatedAt = new Date();
  await offer.save();

  return NextResponse.json({
    ok: true,
    notification: `Offer ${offer.buyerName} is now ${offer.status}.`,
  });
}
