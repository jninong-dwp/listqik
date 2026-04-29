import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";

function validateForFinalize(listing: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  county?: string | null;
  price?: number | null;
  buyerAgentCompPct?: number | null;
  description?: string | null;
  heroImageUrl?: string | null;
  mlsName?: string | null;
  mlsNumber?: string | null;
  listingId?: string | null;
}) {
  const errors: string[] = [];

  if (!listing.street?.trim()) errors.push("Street is required.");
  if (!listing.city?.trim()) errors.push("City is required.");
  if (!listing.state?.trim()) errors.push("State is required.");
  if (!listing.zip?.trim()) errors.push("ZIP is required.");
  if (!listing.county?.trim()) errors.push("County is required.");
  if (typeof listing.price !== "number" || !Number.isFinite(listing.price) || listing.price <= 0) {
    errors.push("Valid list price is required.");
  }
  if (listing.buyerAgentCompPct === null || listing.buyerAgentCompPct === undefined) {
    errors.push("Buyer agent compensation is required.");
  }
  if ((listing.description ?? "").trim().length < 40) {
    errors.push("Description must be at least 40 characters.");
  }
  if (!listing.heroImageUrl?.trim()) {
    errors.push("Hero image is required.");
  }
  if (!listing.mlsName?.trim() && !listing.mlsNumber?.trim() && !listing.listingId?.trim()) {
    errors.push("MLS name, MLS number, or listing ID is required.");
  }

  return errors;
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
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
  const listing = await Listing.findOne({ _id: id, userId });
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const validationErrors = validateForFinalize(listing);
  if (validationErrors.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Listing setup is incomplete.",
        validationErrors,
      },
      { status: 400 },
    );
  }

  listing.status = "ACTIVE";
  listing.setupFinalizedAt = new Date();
  if (!listing.listedOn) {
    listing.listedOn = new Date();
  }
  await listing.save();

  return NextResponse.json({
    ok: true,
    status: listing.status,
    setupFinalizedAt: listing.setupFinalizedAt.toISOString(),
    listedOn: listing.listedOn ? listing.listedOn.toISOString() : null,
  });
}
