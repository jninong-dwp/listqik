import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { validateListingForFinalize } from "@/lib/listing-compliance";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";
import { User } from "@/models/User";
import { isListingStartInFuture, statusForListingStartDate } from "@/lib/listing-status";
import {
  sendInternalListingFinalizedEmail,
  sendSellerListingFinalizedEmail,
} from "@/lib/transactional-email";

function hasMatchingDoc(fileName: string, patterns: RegExp[]) {
  return patterns.some((p) => p.test(fileName));
}

function appBaseUrl(): string {
  const auth = process.env.NEXTAUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
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

  const wasIncomplete = listing.status === "INCOMPLETE";
  const scheduled = isListingStartInFuture(listing.listingStartOn);
  listing.status = statusForListingStartDate(listing.listingStartOn);
  listing.scheduledActivationPending = scheduled;
  listing.setupFinalizedAt = new Date();
  if (listing.status === "ACTIVE" && !listing.listedOn) {
    listing.listedOn = new Date();
  }
  await listing.save();

  /**
   * Fire an internal notification once per listing finalize. We rely on the
   * `wasIncomplete` flag to avoid re-sending when this endpoint is re-hit on an
   * already-finalized listing. Email send is non-blocking so SMTP latency or
   * failure cannot disrupt the seller's success response.
   */
  if (wasIncomplete) {
    void (async () => {
      try {
        const owner = await User.findById(userId, { name: 1, email: 1 }).lean();
        const sellerEmail =
          owner?.email ??
          listing.contactEmail ??
          listing.appointmentEmail ??
          "";
        const sellerName =
          owner?.name ||
          (typeof listing.sellerNames === "string" && listing.sellerNames.trim().length > 0
            ? listing.sellerNames.trim()
            : sellerEmail || "Seller");

        const addressParts = [
          listing.street,
          listing.unit ? `#${listing.unit}` : "",
          listing.city,
          [listing.state, listing.zip].filter(Boolean).join(" "),
        ].filter((part) => typeof part === "string" && part.trim().length > 0);

        const buyerAgentCompSummary =
          listing.buyerAgentCompType === "AMOUNT"
            ? listing.buyerAgentCompAmount !== null && listing.buyerAgentCompAmount !== undefined
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                }).format(listing.buyerAgentCompAmount)
              : null
            : listing.buyerAgentCompPct !== null && listing.buyerAgentCompPct !== undefined
              ? `${listing.buyerAgentCompPct}%`
              : null;

        const baseUrl = appBaseUrl();
        const adminProfileUrl = baseUrl
          ? `${baseUrl}/dashboard/admin/users/${String(userId)}`
          : null;

        const additionalPhotos = Array.isArray(listing.additionalPhotoUrls)
          ? listing.additionalPhotoUrls.filter(
              (u: unknown) => typeof u === "string" && u.trim().length > 0,
            )
          : [];

        const platforms = Array.isArray(listing.listingPlatforms)
          ? listing.listingPlatforms.filter((p: unknown): p is string => typeof p === "string")
          : [];

        const result = await sendInternalListingFinalizedEmail({
          sellerName,
          sellerEmail,
          contactPhone:
            (typeof listing.contactPhone === "string" && listing.contactPhone.trim()) ||
            (typeof listing.appointmentPhone === "string" && listing.appointmentPhone.trim()) ||
            null,
          listingId: String(listing._id),
          userId: String(userId),
          address: addressParts.join(", "),
          county: (typeof listing.county === "string" && listing.county.trim()) || null,
          status: listing.status,
          planLabel: listing.planLabel ?? null,
          price: typeof listing.price === "number" ? listing.price : null,
          buyerAgentCompSummary,
          listingStartOn: listing.listingStartOn ? new Date(listing.listingStartOn) : null,
          listingEndOn: listing.listingEndOn ? new Date(listing.listingEndOn) : null,
          setupFinalizedAt: listing.setupFinalizedAt,
          heroImageUploaded:
            typeof listing.heroImageUrl === "string" && listing.heroImageUrl.trim().length > 0,
          additionalPhotoCount: additionalPhotos.length,
          documentCount: docs.length,
          mlsName: (typeof listing.mlsName === "string" && listing.mlsName.trim()) || null,
          mlsNumber: (typeof listing.mlsNumber === "string" && listing.mlsNumber.trim()) || null,
          listingPlatforms: platforms,
          adminProfileUrl,
        });

        if (!result.sent) {
          console.error("[listing-finalize] internal email not sent:", result.error);
        }

        if (sellerEmail) {
          const dashboardUrl = baseUrl ? `${baseUrl}/dashboard` : "/dashboard";
          const sellerResult = await sendSellerListingFinalizedEmail({
            to: sellerEmail,
            sellerName,
            address: addressParts.join(", "),
            status: listing.status,
            listingStartOn: listing.listingStartOn ? new Date(listing.listingStartOn) : null,
            listingEndOn: listing.listingEndOn ? new Date(listing.listingEndOn) : null,
            dashboardUrl,
          });
          if (!sellerResult.sent) {
            console.error("[listing-finalize] seller email not sent:", sellerResult.error);
          }
        }
      } catch (err) {
        console.error(
          "[listing-finalize] internal email dispatch failed:",
          err instanceof Error ? err.message : err,
        );
      }
    })();
  }

  return NextResponse.json({
    ok: true,
    status: listing.status,
    setupFinalizedAt: listing.setupFinalizedAt.toISOString(),
    listedOn: listing.listedOn ? listing.listedOn.toISOString() : null,
  });
}
