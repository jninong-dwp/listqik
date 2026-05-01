import { Schema, model, models } from "mongoose";

const listingDocumentSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    documentType: { type: String, trim: true, default: "UPLOAD", index: true },
    generatedFromListing: { type: Boolean, default: false },
    signatureProvider: { type: String, trim: true, default: "" },
    signerEmail: { type: String, trim: true, lowercase: true, default: "" },
    signatureStatus: {
      type: String,
      enum: ["NOT_REQUESTED", "REQUESTED", "SIGNED"],
      default: "NOT_REQUESTED",
      index: true,
    },
    signatureRequestedAt: { type: Date, default: null },
    signedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ListingDocument =
  models.ListingDocument ?? model("ListingDocument", listingDocumentSchema);
