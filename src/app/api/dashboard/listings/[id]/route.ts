import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";

type PatchBody = {
  price?: number;
  buyerAgentCompPct?: number | null;
  description?: string;
  status?: string;
  planLabel?: string;
  county?: string;
  mlsName?: string;
  mlsNumber?: string;
  listingId?: string;
  heroImageUrl?: string;
  listedOn?: string | null;
  expiresOn?: string | null;
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId });
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const allowed = [
    "INCOMPLETE",
    "ACTIVE",
    "PENDING",
    "EXPIRED",
    "SOLD",
  ] as const;
  type Status = (typeof allowed)[number];

  if (body.price !== undefined) {
    if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0) {
      return NextResponse.json({ ok: false, error: "Invalid price." }, { status: 400 });
    }
    listing.price = Math.round(body.price);
  }
  if (body.buyerAgentCompPct !== undefined) {
    listing.buyerAgentCompPct =
      body.buyerAgentCompPct === null ? null : Number(body.buyerAgentCompPct);
  }
  if (body.description !== undefined) {
    listing.description = String(body.description);
  }
  if (body.planLabel !== undefined) {
    listing.planLabel = body.planLabel?.trim() || undefined;
  }
  if (body.county !== undefined) {
    listing.county = body.county?.trim() || undefined;
  }
  if (body.mlsName !== undefined) {
    listing.mlsName = body.mlsName?.trim() || undefined;
  }
  if (body.mlsNumber !== undefined) {
    listing.mlsNumber = body.mlsNumber?.trim() || undefined;
  }
  if (body.listingId !== undefined) {
    listing.listingId = body.listingId?.trim() || undefined;
  }
  if (body.heroImageUrl !== undefined) {
    listing.heroImageUrl = body.heroImageUrl?.trim() || undefined;
  }
  if (body.status !== undefined) {
    if (!allowed.includes(body.status as Status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    listing.status = body.status as Status;
  }
  if (body.listedOn !== undefined) {
    listing.listedOn = body.listedOn ? new Date(body.listedOn) : null;
  }
  if (body.expiresOn !== undefined) {
    listing.expiresOn = body.expiresOn ? new Date(body.expiresOn) : null;
  }

  await listing.save();
  return NextResponse.json({ ok: true });
}
