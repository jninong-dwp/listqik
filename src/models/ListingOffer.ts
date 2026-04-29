import { Schema, model, models } from "mongoose";

const listingOfferSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    buyerName: { type: String, required: true, trim: true },
    buyerEmail: { type: String, trim: true, lowercase: true },
    buyerPhone: { type: String, trim: true },
    amount: { type: Number, required: true },
    message: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["RECEIVED", "REVIEWING", "COUNTERED", "ACCEPTED", "DECLINED", "WITHDRAWN"],
      default: "RECEIVED",
      index: true,
    },
    statusNote: { type: String, trim: true, default: "" },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const ListingOffer = models.ListingOffer ?? model("ListingOffer", listingOfferSchema);
