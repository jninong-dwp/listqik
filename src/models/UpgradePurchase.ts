import { Schema, model, models } from "mongoose";

const upgradePurchaseItemSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    slug: { type: String, trim: true, default: "" },
    priceId: { type: String, trim: true, default: "" },
    productId: { type: String, trim: true, default: "" },
    quantity: { type: Number, default: 1 },
    amount: { type: Number, default: null },
    raw: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const upgradePurchaseSchema = new Schema(
  {
    purchaserEmail: { type: String, lowercase: true, trim: true, default: null, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    externalUserId: { type: String, trim: true, default: null, index: true },
    checkoutSessionId: { type: String, trim: true, default: null, index: true },
    contactId: { type: String, trim: true, default: null, index: true },
    externalOrderId: { type: String, trim: true, default: null, sparse: true, unique: true },
    paymentStatus: { type: String, trim: true, default: null },
    locationId: { type: String, trim: true, default: null },
    currency: { type: String, trim: true, default: null },
    amountTotal: { type: Number, default: null },
    purchasedAt: { type: Date, default: Date.now, index: true },
    upgradeSlugs: { type: [String], default: [] },
    items: { type: [upgradePurchaseItemSchema], default: [] },
    rawPayload: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

export const UpgradePurchase =
  models.UpgradePurchase ?? model("UpgradePurchase", upgradePurchaseSchema);
