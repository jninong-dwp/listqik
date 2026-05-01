import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";

const PACKAGE_DOCS = [
  { type: "IABS", label: "Information About Brokerage Services" },
  { type: "SELLER_DISCLOSURE", label: "Seller Disclosure Notice" },
  { type: "LISTING_AGREEMENT", label: "Listing Agreement" },
] as const;

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
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const created = [];
  for (const doc of PACKAGE_DOCS) {
    const fileName = `${doc.type.toLowerCase()}-${listing.street.replace(/\s+/g, "-").toLowerCase()}.txt`;
    const fileUrl = `/api/dashboard/listings/${id}/legal-package/${doc.type}`;
    const saved = await ListingDocument.create({
      listingId: id,
      fileName,
      fileUrl,
      documentType: doc.type,
      generatedFromListing: true,
      signatureStatus: "NOT_REQUESTED",
    });
    created.push({
      id: saved._id.toString(),
      fileName: saved.fileName,
      fileUrl: saved.fileUrl,
      documentType: saved.documentType,
    });
  }

  return NextResponse.json({ ok: true, documents: created });
}
