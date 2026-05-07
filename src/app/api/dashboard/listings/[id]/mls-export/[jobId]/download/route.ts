import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { buildMlsListingSheetPdf } from "@/lib/mls-listing-sheet-pdf";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";
import { ListingMlsExportJob } from "@/models/ListingMlsExportJob";
import { ListingOffer } from "@/models/ListingOffer";
import { ListingOpenHouse } from "@/models/ListingOpenHouse";
import { ListingUpgradeRequest } from "@/models/ListingUpgradeRequest";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string; jobId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const { id, jobId } = await ctx.params;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(jobId)) {
    return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }
  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }
  const job = await ListingMlsExportJob.findOne({ _id: jobId, listingId: id }).lean();
  if (!job) {
    return NextResponse.json({ ok: false, error: "Export job not found." }, { status: 404 });
  }
  if (job.status !== "COMPLETED") {
    return NextResponse.json({ ok: false, error: "Export is not completed yet." }, { status: 409 });
  }

  if (job.format === "pdf") {
    const [documents, offers, upgrades, openHouses] = await Promise.all([
      ListingDocument.find({ listingId: id }).lean(),
      ListingOffer.find({ listingId: id }).lean(),
      ListingUpgradeRequest.find({ listingId: id }).lean(),
      ListingOpenHouse.find({ listingId: id }).lean(),
    ]);

    const pdfBytes = await buildMlsListingSheetPdf({
      listing,
      documents,
      offers,
      upgrades,
      openHouses,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${job.fileName || "mls-listing-sheet.pdf"}"`,
        "cache-control": "no-store",
      },
    });
  }

  return new NextResponse(job.fileContent || "", {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${job.fileName || "mls-export.txt"}"`,
      "cache-control": "no-store",
    },
  });
}
