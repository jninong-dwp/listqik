import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingOpenHouse } from "@/models/ListingOpenHouse";

type PatchBody = {
  title?: string;
  startAt?: string;
  endAt?: string;
  notes?: string;
  status?: string;
};

const allowedStatuses = ["SCHEDULED", "CANCELLED", "COMPLETED"] as const;
type OpenHouseStatus = (typeof allowedStatuses)[number];

function parseDate(input: string | undefined): Date | null {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
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

async function assertListingOwnership(listingId: string, userId: string) {
  const listing = await Listing.findOne({ _id: listingId, userId: new Types.ObjectId(userId) }).lean();
  return Boolean(listing);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string; openHouseId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id, openHouseId } = await ctx.params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(openHouseId)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  await connectDb();
  if (!(await assertListingOwnership(id, session.user.id))) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const openHouse = await ListingOpenHouse.findOne({ _id: openHouseId, listingId: id });
  if (!openHouse) {
    return NextResponse.json({ ok: false, error: "Open house not found." }, { status: 404 });
  }

  if (body.title !== undefined) {
    openHouse.title = String(body.title).trim() || openHouse.title;
  }
  if (body.notes !== undefined) {
    openHouse.notes = String(body.notes).trim();
  }
  if (body.status !== undefined) {
    const status = String(body.status).trim().toUpperCase();
    if (!allowedStatuses.includes(status as OpenHouseStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    openHouse.status = status as OpenHouseStatus;
  }

  const nextStartAt = body.startAt !== undefined ? parseDate(body.startAt) : openHouse.startAt;
  const nextEndAt = body.endAt !== undefined ? parseDate(body.endAt) : openHouse.endAt;
  if (!nextStartAt || !nextEndAt) {
    return NextResponse.json({ ok: false, error: "Invalid date values." }, { status: 400 });
  }
  const rangeError = validateRange(nextStartAt, nextEndAt);
  if (rangeError) {
    return NextResponse.json({ ok: false, error: rangeError }, { status: 400 });
  }

  const conflict = await ListingOpenHouse.findOne({
    _id: { $ne: openHouse._id },
    listingId: id,
    status: "SCHEDULED",
    startAt: { $lt: nextEndAt },
    endAt: { $gt: nextStartAt },
  }).lean();
  if (conflict && (openHouse.status === "SCHEDULED" || body.status === "SCHEDULED")) {
    return NextResponse.json(
      { ok: false, error: "Open house overlaps an existing scheduled event." },
      { status: 409 },
    );
  }

  openHouse.startAt = nextStartAt;
  openHouse.endAt = nextEndAt;
  await openHouse.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; openHouseId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id, openHouseId } = await ctx.params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(openHouseId)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  await connectDb();
  if (!(await assertListingOwnership(id, session.user.id))) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const result = await ListingOpenHouse.deleteOne({ _id: openHouseId, listingId: id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ ok: false, error: "Open house not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
