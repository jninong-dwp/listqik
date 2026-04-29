import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";
import { ListingMlsExportJob } from "@/models/ListingMlsExportJob";
import { ListingOffer } from "@/models/ListingOffer";
import { ListingOpenHouse } from "@/models/ListingOpenHouse";
import { ListingUpgradeRequest } from "@/models/ListingUpgradeRequest";

function serialize(job: {
  _id: Types.ObjectId;
  status: string;
  progress: number;
  fileName?: string | null;
  error?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}) {
  return {
    id: job._id.toString(),
    status: job.status,
    progress: job.progress,
    fileName: job.fileName ?? "",
    error: job.error ?? "",
    startedAt: job.startedAt ? job.startedAt.toISOString() : null,
    completedAt: job.completedAt ? job.completedAt.toISOString() : null,
    createdAt: job.createdAt ? job.createdAt.toISOString() : null,
    updatedAt: job.updatedAt ? job.updatedAt.toISOString() : null,
  };
}

function makeExportContent(input: {
  listing: {
    street?: string;
    unit?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
    status?: string;
    mlsName?: string;
    mlsNumber?: string;
    listingId?: string;
    price?: number;
    buyerAgentCompPct?: number | null;
    description?: string;
    heroImageUrl?: string;
  };
  documents: Array<{ fileName?: string; fileUrl?: string }>;
  openHouses: Array<{ title?: string; startAt?: Date; endAt?: Date; status?: string }>;
  offers: Array<{ buyerName?: string; amount?: number; status?: string }>;
  upgrades: Array<{ upgradeName?: string; amount?: number; status?: string }>;
}) {
  const l = input.listing;
  const lines: string[] = [];
  lines.push("MLS LISTING EXPORT");
  lines.push(`Generated At: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("Listing");
  lines.push(`Address: ${[l.street, l.unit, l.city, l.state, l.zip].filter(Boolean).join(", ")}`);
  lines.push(`County: ${l.county ?? ""}`);
  lines.push(`Status: ${l.status ?? ""}`);
  lines.push(`MLS Name: ${l.mlsName ?? ""}`);
  lines.push(`MLS Number: ${l.mlsNumber ?? ""}`);
  lines.push(`Internal Listing ID: ${l.listingId ?? ""}`);
  lines.push(`Price: ${l.price ?? 0}`);
  lines.push(`Buyer Agent Compensation: ${l.buyerAgentCompPct ?? ""}`);
  lines.push(`Hero Image URL: ${l.heroImageUrl ?? ""}`);
  lines.push(`Description: ${l.description ?? ""}`);
  lines.push("");
  lines.push("Documents");
  if (input.documents.length === 0) lines.push("- none");
  input.documents.forEach((doc) => lines.push(`- ${doc.fileName ?? "Document"} | ${doc.fileUrl ?? ""}`));
  lines.push("");
  lines.push("Open Houses");
  if (input.openHouses.length === 0) lines.push("- none");
  input.openHouses.forEach((event) =>
    lines.push(
      `- ${event.title ?? "Open House"} | ${event.startAt?.toISOString() ?? ""} to ${
        event.endAt?.toISOString() ?? ""
      } | ${event.status ?? ""}`,
    ),
  );
  lines.push("");
  lines.push("Offers");
  if (input.offers.length === 0) lines.push("- none");
  input.offers.forEach((offer) =>
    lines.push(`- ${offer.buyerName ?? "Buyer"} | $${offer.amount ?? 0} | ${offer.status ?? ""}`),
  );
  lines.push("");
  lines.push("Upgrade Requests");
  if (input.upgrades.length === 0) lines.push("- none");
  input.upgrades.forEach((request) =>
    lines.push(`- ${request.upgradeName ?? "Upgrade"} | $${request.amount ?? 0} | ${request.status ?? ""}`),
  );
  return lines.join("\n");
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
  const latestJob = await ListingMlsExportJob.findOne({ listingId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, job: latestJob ? serialize(latestJob) : null });
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
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const existingRunning = await ListingMlsExportJob.findOne({
    listingId: id,
    status: { $in: ["QUEUED", "PROCESSING"] },
  }).sort({ createdAt: -1 });
  if (existingRunning) {
    return NextResponse.json({ ok: true, job: serialize(existingRunning) });
  }

  const docs = await ListingDocument.find({ listingId: id }).lean();
  const openHouses = await ListingOpenHouse.find({ listingId: id }).lean();
  const offers = await ListingOffer.find({ listingId: id }).lean();
  const upgrades = await ListingUpgradeRequest.find({ listingId: id }).lean();
  const content = makeExportContent({
    listing,
    documents: docs,
    openHouses,
    offers,
    upgrades,
  });

  const fileName = `mls-export-${id}-${Date.now()}.txt`;
  const job = await ListingMlsExportJob.create({
    listingId: id,
    status: "QUEUED",
    progress: 0,
    fileName,
    format: "txt",
    fileContent: content,
  });
  return NextResponse.json({ ok: true, job: serialize(job) });
}
