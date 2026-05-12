import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { validateListingForFinalize } from "@/lib/listing-compliance";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";

function hasMatchingDoc(fileName: string, patterns: RegExp[]) {
  return patterns.some((p) => p.test(fileName));
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

  const validationErrors = validateListingForFinalize(listing);
  const docs = await ListingDocument.find({ listingId: listing._id }).lean();
  const docNames = docs.map((d) => d.fileName.toLowerCase());

  if (
    (listing.propertyType === "CONDOMINIUM" || listing.associationType === "CONDO") &&
    !docNames.some((n) => hasMatchingDoc(n, [/condo/, /addendum/]))
  ) {
    validationErrors.push("Condo addendum document upload is required.");
  }
  if ((listing.yearBuilt ?? 0) > 0 && (listing.yearBuilt ?? 0) < 1978) {
    if (!docNames.some((n) => hasMatchingDoc(n, [/lead/, /paint/]))){
      validationErrors.push("Lead-based paint disclosure document upload is required.");
    }
  }
  if (listing.tenantOccupied && !docNames.some((n) => hasMatchingDoc(n, [/tenant/, /authorization/]))){
    validationErrors.push("Tenant authorization document upload is required.");
  }
  if (listing.isInMudWaterDistrict && !docNames.some((n) => hasMatchingDoc(n, [/mud/, /water/, /district/, /notice/]))){
    validationErrors.push("MUD/water district notice document upload is required.");
  }
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

  const start = listing.listingStartOn ? new Date(listing.listingStartOn) : null;
  const startValid = start && Number.isFinite(start.getTime());
  const today = new Date();
  const startDay = startValid
    ? new Date(start!.getFullYear(), start!.getMonth(), start!.getDate()).getTime()
    : 0;
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  /** Future start dates stay pending until the start day; same-day or past go active now. */
  listing.status = startValid && startDay > todayDay ? "PENDING" : "ACTIVE";
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
