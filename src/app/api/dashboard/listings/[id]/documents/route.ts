import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";

type CreateBody = {
  fileName?: string;
  fileUrl?: string;
  documentType?: string;
  generatedFromListing?: boolean;
  signatureProvider?: string;
  signerEmail?: string;
  signatureStatus?: "NOT_REQUESTED" | "REQUESTED" | "SIGNED";
};

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

  const docs = await ListingDocument.find({ listingId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    ok: true,
    documents: docs.map((d) => ({
      id: d._id.toString(),
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      documentType: d.documentType ?? "UPLOAD",
      generatedFromListing: Boolean(d.generatedFromListing),
      signatureProvider: d.signatureProvider ?? "",
      signerEmail: d.signerEmail ?? "",
      signatureStatus: d.signatureStatus ?? "NOT_REQUESTED",
      signatureRequestedAt: d.signatureRequestedAt instanceof Date ? d.signatureRequestedAt.toISOString() : null,
      signedAt: d.signedAt instanceof Date ? d.signedAt.toISOString() : null,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : null,
    })),
  });
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

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const fileName = body.fileName?.trim();
  const fileUrl = body.fileUrl?.trim();
  if (!fileName || !fileUrl) {
    return NextResponse.json({ ok: false, error: "fileName and fileUrl are required." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const doc = await ListingDocument.create({
    listingId: id,
    fileName,
    fileUrl,
    documentType: body.documentType ?? "UPLOAD",
    generatedFromListing: Boolean(body.generatedFromListing),
    signatureProvider: body.signatureProvider?.trim() ?? "",
    signerEmail: body.signerEmail?.trim().toLowerCase() ?? "",
    signatureStatus: body.signatureStatus ?? "NOT_REQUESTED",
    signatureRequestedAt: body.signatureStatus === "REQUESTED" ? new Date() : null,
    signedAt: body.signatureStatus === "SIGNED" ? new Date() : null,
  });

  return NextResponse.json({
    ok: true,
    document: {
      id: doc._id.toString(),
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      documentType: doc.documentType ?? "UPLOAD",
      generatedFromListing: Boolean(doc.generatedFromListing),
      signatureProvider: doc.signatureProvider ?? "",
      signerEmail: doc.signerEmail ?? "",
      signatureStatus: doc.signatureStatus ?? "NOT_REQUESTED",
      signatureRequestedAt: doc.signatureRequestedAt instanceof Date ? doc.signatureRequestedAt.toISOString() : null,
      signedAt: doc.signedAt instanceof Date ? doc.signedAt.toISOString() : null,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    },
  });
}
