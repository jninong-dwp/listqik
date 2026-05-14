import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { isAdminEmail } from "@/lib/admin";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingOffer } from "@/models/ListingOffer";

type OfferBody = {
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  amount?: number;
  message?: string;
  status?: string;
};

const offerStatuses = [
  "RECEIVED",
  "REVIEWING",
  "COUNTERED",
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
] as const;
type OfferStatus = (typeof offerStatuses)[number];

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

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 }) };
  }
  if (!isAdminEmail(session.user.email)) {
    return { error: NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 }) };
  }
  return { session };
}

/**
 * GET /api/admin/listings/[id]/offers
 *
 * Admin-only: list every offer for the given listing regardless of owner.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }

  await connectDb();
  const listing = await Listing.findById(id).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const offers = await ListingOffer.find({ listingId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, offers: offers.map((offer) => serialize(offer)) });
}

/**
 * POST /api/admin/listings/[id]/offers
 *
 * Admin-only: create a buyer offer on behalf of any seller's listing.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

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
  const statusRaw = String(body.status ?? "RECEIVED").trim().toUpperCase();
  const status = offerStatuses.includes(statusRaw as OfferStatus)
    ? (statusRaw as OfferStatus)
    : "RECEIVED";

  if (!buyerName || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: "buyerName and a valid amount are required." },
      { status: 400 },
    );
  }

  await connectDb();
  const listing = await Listing.findById(id).lean();
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
    status,
    statusUpdatedAt: new Date(),
  });

  return NextResponse.json({
    ok: true,
    offer: serialize(offer),
  });
}
