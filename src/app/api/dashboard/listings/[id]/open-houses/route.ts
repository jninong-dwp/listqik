import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingOpenHouse } from "@/models/ListingOpenHouse";

type CreateBody = {
  title?: string;
  startAt?: string;
  endAt?: string;
  notes?: string;
};

function parseDate(input: string | undefined): Date | null {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function serialize(doc: {
  _id: Types.ObjectId;
  title: string;
  startAt: Date;
  endAt: Date;
  notes?: string | null;
  status: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    startAt: doc.startAt.toISOString(),
    endAt: doc.endAt.toISOString(),
    notes: doc.notes ?? "",
    status: doc.status,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
  };
}

function validateRange(startAt: Date, endAt: Date) {
  if (endAt <= startAt) {
    return "End time must be after start time.";
  }
  const durationMs = endAt.getTime() - startAt.getTime();
  if (durationMs > 12 * 60 * 60 * 1000) {
    return "Open house duration cannot exceed 12 hours.";
  }
  return null;
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

  const rows = await ListingOpenHouse.find({ listingId: id }).sort({ startAt: 1 }).lean();
  return NextResponse.json({ ok: true, openHouses: rows.map((row) => serialize(row)) });
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

  const title = String(body.title ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const startAt = parseDate(body.startAt);
  const endAt = parseDate(body.endAt);
  if (!title || !startAt || !endAt) {
    return NextResponse.json({ ok: false, error: "title, startAt, and endAt are required." }, { status: 400 });
  }
  if (startAt.getTime() < Date.now() - 5 * 60 * 1000) {
    return NextResponse.json({ ok: false, error: "Open house must start in the future." }, { status: 400 });
  }
  const rangeError = validateRange(startAt, endAt);
  if (rangeError) {
    return NextResponse.json({ ok: false, error: rangeError }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const conflict = await ListingOpenHouse.findOne({
    listingId: id,
    status: "SCHEDULED",
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  }).lean();
  if (conflict) {
    return NextResponse.json(
      { ok: false, error: "Open house overlaps an existing scheduled event." },
      { status: 409 },
    );
  }

  const doc = await ListingOpenHouse.create({
    listingId: id,
    title,
    startAt,
    endAt,
    notes,
    status: "SCHEDULED",
  });

  return NextResponse.json({ ok: true, openHouse: serialize(doc) });
}
