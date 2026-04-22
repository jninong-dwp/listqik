import { Schema, model, models } from "mongoose";

const planPurchaseSchema = new Schema(
  {
    purchaserEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING_CLAIM", "ACTIVE", "EXPIRED"],
      default: "PENDING_CLAIM",
    },
    purchasedAt: { type: Date, default: Date.now },
    claimedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const PlanPurchase = models.PlanPurchase ?? model("PlanPurchase", planPurchaseSchema);
