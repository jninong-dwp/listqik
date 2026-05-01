import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";

type RequestBody = {
  documentId?: string;
  signerEmail?: string;
  provider?: string;
  action?: "REQUEST" | "MARK_SIGNED";
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.documentId || !Types.ObjectId.isValid(body.documentId)) {
    return NextResponse.json({ ok: false, error: "Valid documentId is required." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const document = await ListingDocument.findOne({ _id: body.documentId, listingId: id });
  if (!document) {
    return NextResponse.json({ ok: false, error: "Document not found for listing." }, { status: 404 });
  }

  if (body.action === "MARK_SIGNED") {
    document.signatureStatus = "SIGNED";
    document.signedAt = new Date();
  } else {
    document.signatureStatus = "REQUESTED";
    document.signatureRequestedAt = new Date();
    document.signerEmail = body.signerEmail?.trim().toLowerCase() ?? "";
    document.signatureProvider = body.provider?.trim() ?? "MANUAL";
  }
  await document.save();

  return NextResponse.json({
    ok: true,
    document: {
      id: document._id.toString(),
      signatureStatus: document.signatureStatus,
      signerEmail: document.signerEmail ?? "",
      signatureProvider: document.signatureProvider ?? "",
      signatureRequestedAt: document.signatureRequestedAt instanceof Date ? document.signatureRequestedAt.toISOString() : null,
      signedAt: document.signedAt instanceof Date ? document.signedAt.toISOString() : null,
    },
  });
}
