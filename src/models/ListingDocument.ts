import { Schema, model, models } from "mongoose";

const listingDocumentSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const ListingDocument =
  models.ListingDocument ?? model("ListingDocument", listingDocumentSchema);
