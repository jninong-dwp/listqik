import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";

type DocType = "IABS" | "SELLER_DISCLOSURE" | "LISTING_AGREEMENT";

function getBody(docType: DocType, listing: { street: string; city: string; state: string; zip: string; sellerNames?: string; price: number; listingStartOn?: Date | null; listingEndOn?: Date | null; }) {
  const header = `${docType}\nGenerated from listing data\n`;
  const lines = [
    `Property: ${listing.street}, ${listing.city}, ${listing.state} ${listing.zip}`,
    `Seller(s): ${listing.sellerNames ?? "N/A"}`,
    `List Price: ${listing.price}`,
    `Listing Start: ${listing.listingStartOn ? listing.listingStartOn.toISOString().slice(0, 10) : "N/A"}`,
    `Listing End: ${listing.listingEndOn ? listing.listingEndOn.toISOString().slice(0, 10) : "N/A"}`,
  ];
  return `${header}\n${lines.join("\n")}\n`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; docType: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id, docType } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }
  if (!["IABS", "SELLER_DISCLOSURE", "LISTING_AGREEMENT"].includes(docType)) {
    return NextResponse.json({ ok: false, error: "Invalid document type." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const body = getBody(docType as DocType, listing);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${docType.toLowerCase()}-${id}.txt"`,
    },
  });
}
