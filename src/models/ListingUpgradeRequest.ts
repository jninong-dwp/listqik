import { Schema, model, models } from "mongoose";

const listingUpgradeRequestSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    slug: { type: String, required: true, trim: true, index: true },
    upgradeName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["REQUESTED", "IN_REVIEW", "APPROVED", "FULFILLED", "DECLINED", "CANCELLED"],
      default: "REQUESTED",
      index: true,
    },
    requestNote: { type: String, trim: true, default: "" },
    reconciliationRef: { type: String, trim: true, default: "" },
    statusNote: { type: String, trim: true, default: "" },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const ListingUpgradeRequest =
  models.ListingUpgradeRequest ?? model("ListingUpgradeRequest", listingUpgradeRequestSchema);
