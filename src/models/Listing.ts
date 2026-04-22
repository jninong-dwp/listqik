import { Schema, model, models } from "mongoose";

const listingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    street: { type: String, required: true, trim: true },
    unit: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zip: { type: String, required: true, trim: true },
    county: { type: String, trim: true },
    mlsName: { type: String, trim: true },
    mlsNumber: { type: String, trim: true },
    listingId: { type: String, trim: true },
    status: {
      type: String,
      enum: ["INCOMPLETE", "ACTIVE", "PENDING", "EXPIRED", "SOLD"],
      default: "INCOMPLETE",
    },
    planLabel: { type: String, trim: true },
    price: { type: Number, required: true },
    buyerAgentCompPct: { type: Number, default: null },
    description: { type: String, default: "" },
    heroImageUrl: { type: String, trim: true },
    orderedOn: { type: Date, default: null },
    listedOn: { type: Date, default: null },
    expiresOn: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Listing = models.Listing ?? model("Listing", listingSchema);
