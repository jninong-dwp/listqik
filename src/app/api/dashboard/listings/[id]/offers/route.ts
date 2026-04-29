import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingOffer } from "@/models/ListingOffer";

type OfferBody = {
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  amount?: number;
  message?: string;
};

function serialize(offer: {
  _id: Types.ObjectId;
  buyerName: string;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  amount: number;
  message?: string | null;
  status: string;
  statusNote?: string | null;
  statusUpdatedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}) {
  return {
    id: offer._id.toString(),
    buyerName: offer.buyerName,
    buyerEmail: offer.buyerEmail ?? "",
    buyerPhone: offer.buyerPhone ?? "",
    amount: offer.amount,
    message: offer.message ?? "",
    status: offer.status,
    statusNote: offer.statusNote ?? "",
    statusUpdatedAt: offer.statusUpdatedAt ? offer.statusUpdatedAt.toISOString() : null,
    createdAt: offer.createdAt ? offer.createdAt.toISOString() : null,
    updatedAt: offer.updatedAt ? offer.updatedAt.toISOString() : null,
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
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const offers = await ListingOffer.find({ listingId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, offers: offers.map((offer) => serialize(offer)) });
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

  let body: OfferBody;
  try {
    body = (await req.json()) as OfferBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const buyerName = String(body.buyerName ?? "").trim();
  const buyerEmail = String(body.buyerEmail ?? "").trim().toLowerCase();
  const buyerPhone = String(body.buyerPhone ?? "").trim();
  const message = String(body.message ?? "").trim();
  const amount = Number(body.amount);

  if (!buyerName || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: "buyerName and a valid amount are required." },
      { status: 400 },
    );
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const offer = await ListingOffer.create({
    listingId: id,
    buyerName,
    buyerEmail: buyerEmail || undefined,
    buyerPhone: buyerPhone || undefined,
    amount: Math.round(amount),
    message,
    status: "RECEIVED",
    statusUpdatedAt: new Date(),
  });

  return NextResponse.json({
    ok: true,
    offer: serialize(offer),
    notification: `Offer received from ${buyerName} for $${Math.round(amount).toLocaleString("en-US")}.`,
  });
}
