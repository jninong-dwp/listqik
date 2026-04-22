import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Types } from "mongoose";
import { Types as MongooseTypes } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { PlanPurchase } from "@/models/PlanPurchase";

function iso(d: unknown): string | null {
  if (!d) {
    return null;
  }
  if (d instanceof Date) {
    return d.toISOString();
  }
  const t = new Date(String(d));
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

function serializeListing(doc: {
  _id: Types.ObjectId;
  street: string;
  unit?: string | null;
  city: string;
  state: string;
  zip: string;
  county?: string | null;
  mlsName?: string | null;
  mlsNumber?: string | null;
  listingId?: string | null;
  status: string;
  planLabel?: string | null;
  price: number;
  buyerAgentCompPct?: number | null;
  description?: string | null;
  heroImageUrl?: string | null;
  orderedOn?: Date | null;
  listedOn?: Date | null;
  expiresOn?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}) {
  return {
    id: doc._id.toString(),
    street: doc.street,
    unit: doc.unit ?? "",
    city: doc.city,
    state: doc.state,
    zip: doc.zip,
    county: doc.county ?? "",
    mlsName: doc.mlsName ?? "",
    mlsNumber: doc.mlsNumber ?? "",
    listingId: doc.listingId ?? "",
    status: doc.status,
    planLabel: doc.planLabel ?? "",
    price: doc.price,
    buyerAgentCompPct: doc.buyerAgentCompPct ?? null,
    description: doc.description ?? "",
    heroImageUrl: doc.heroImageUrl ?? "",
    orderedOn: iso(doc.orderedOn),
    listedOn: iso(doc.listedOn),
    expiresOn: iso(doc.expiresOn),
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  await connectDb();
  const userId = new MongooseTypes.ObjectId(session.user.id);
  const rows = await Listing.find({ userId }).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ ok: true, listings: rows.map((r) => serializeListing(r)) });
}

type CreateBody = {
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  planLabel?: string;
  price?: number;
  description?: string;
  heroImageUrl?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const street = body.street?.trim();
  const city = body.city?.trim();
  const state = body.state?.trim();
  const zip = body.zip?.trim();
  const price = body.price;

  if (!street || !city || !state || !zip || typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return NextResponse.json(
      { ok: false, error: "street, city, state, zip, and a valid price are required." },
      { status: 400 },
    );
  }

  await connectDb();
  const userId = new MongooseTypes.ObjectId(session.user.id);

  const hasPlan = await PlanPurchase.exists({ userId, status: "ACTIVE" });
  if (!hasPlan) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No active listing plan on this account. Complete checkout first, or ensure your purchase webhook used the same email.",
      },
      { status: 403 },
    );
  }

  const doc = await Listing.create({
    userId,
    street,
    unit: body.unit?.trim(),
    city,
    state,
    zip,
    county: body.county?.trim(),
    planLabel: body.planLabel?.trim(),
    price: Math.round(price),
    description: body.description?.trim() ?? "",
    heroImageUrl: body.heroImageUrl?.trim(),
    orderedOn: new Date(),
  });

  const saved = await Listing.findById(doc._id).lean();
  if (!saved) {
    return NextResponse.json({ ok: false, error: "Failed to load listing." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, listing: serializeListing(saved) });
}
