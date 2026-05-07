import { Schema, model, models } from "mongoose";

const listingMlsExportJobSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    status: {
      type: String,
      enum: ["QUEUED", "PROCESSING", "COMPLETED", "FAILED"],
      default: "QUEUED",
      index: true,
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    fileName: { type: String, trim: true, default: "" },
    format: { type: String, enum: ["txt", "pdf"], default: "txt" },
    fileContent: { type: String, default: "" },
    error: { type: String, trim: true, default: "" },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ListingMlsExportJob =
  models.ListingMlsExportJob ?? model("ListingMlsExportJob", listingMlsExportJobSchema);
