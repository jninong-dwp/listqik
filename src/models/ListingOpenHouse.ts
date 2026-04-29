import { Schema, model, models } from "mongoose";

const listingOpenHouseSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    title: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    notes: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["SCHEDULED", "CANCELLED", "COMPLETED"],
      default: "SCHEDULED",
      index: true,
    },
  },
  { timestamps: true },
);

export const ListingOpenHouse = models.ListingOpenHouse ?? model("ListingOpenHouse", listingOpenHouseSchema);
