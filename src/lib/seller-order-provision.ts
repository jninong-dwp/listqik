import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Listing } from "@/models/Listing";
import { PlanPurchase } from "@/models/PlanPurchase";
import { User } from "@/models/User";
import {
  hasValidCoreListingAddress,
  normalizeListingAddressPart,
} from "@/lib/listing-address";
import { newPasswordSetupSecret, sha256Hex } from "@/lib/password-setup-token";

export type OrderWebhookPayload = {
  externalOrderId?: string;
  contact?: {
    email?: string;
    fullName?: string;
    phone?: string;
  };
  plan?: {
    id?: string;
    name?: string;
    price?: string;
    closeFee?: string;
  };
  property?: {
    address?: string;
    unit?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
    propertyType?: string;
  };
  upgrades?: Array<{ name?: string; price?: number }>;
  payment?: {
    currency?: string | null;
    amountTotal?: number | null;
    paymentStatus?: string | null;
    couponCode?: string | null;
  };
};

function listingPropertyType(raw?: string): "SINGLE_FAMILY" | "CONDOMINIUM" {
  const t = raw?.toLowerCase().trim() ?? "";
  if (t.includes("condo")) return "CONDOMINIUM";
  return "SINGLE_FAMILY";
}

async function unusablePasswordHash(): Promise<string> {
  return bcrypt.hash(randomBytes(32).toString("hex"), 12);
}

function appBaseUrl(): string {
  const auth = process.env.NEXTAUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
}

function buildIntroDescription(
  rawPropertyType: string | undefined,
  upgrades: OrderWebhookPayload["upgrades"],
): string {
  const upgradeSummary = (upgrades ?? [])
    .map((u) => `${u.name ?? "Upgrade"}${typeof u.price === "number" ? ` ($${u.price})` : ""}`)
    .join(", ");
  return [
    "Draft listing created after checkout.",
    rawPropertyType ? `Property type: ${rawPropertyType}.` : "",
    upgradeSummary ? `Selected upgrades: ${upgradeSummary}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export type ProvisionSellerResult =
  | { status: "duplicate" }
  | {
      status: "ok";
      /** True when a user row already existed before this webhook ran */
      linkedToUser: boolean;
      createdUser: boolean;
      setupAccountUrl?: string;
      listingCreated: boolean;
    };

/**
 * Idempotent: same `externalOrderId` returns duplicate without writing again.
 * Creates user + password-setup link when the buyer is new; adds draft listing when property fields are present.
 */
export async function provisionSellerFromPaidOrder(
  body: OrderWebhookPayload,
): Promise<ProvisionSellerResult> {
  const email = body.contact?.email?.toLowerCase().trim();
  const planId = body.plan?.id?.trim();
  const planName = body.plan?.name?.trim() ?? planId;
  const planPrice = body.plan?.price?.trim();
  const externalOrderId = body.externalOrderId?.trim();

  if (!email || !planId) {
    throw new Error("contact.email and plan.id are required.");
  }

  if (externalOrderId) {
    const existingPurchase = await PlanPurchase.findOne({ externalOrderId }).lean();
    if (existingPurchase) {
      return { status: "duplicate" };
    }
  }

  let user = await User.findOne({ email });
  let createdUser = false;
  let setupSecretPlain: string | undefined;

  if (!user) {
    const fullName =
      body.contact?.fullName?.trim() ||
      email.split("@")[0]?.replace(/[._]/g, " ") ||
      "Seller";
    const phone = body.contact?.phone?.trim();
    setupSecretPlain = newPasswordSetupSecret();
    const tokenSha = sha256Hex(setupSecretPlain);
    const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    user = await User.create({
      email,
      name: fullName,
      phone: phone || undefined,
      passwordHash: await unusablePasswordHash(),
      passwordSetupTokenSha256: tokenSha,
      passwordSetupExpiresAt: expires,
    });
    createdUser = true;
  }

  await PlanPurchase.create({
    purchaserEmail: email,
    userId: user._id,
    planId,
    planName: planName || planId,
    status: "ACTIVE",
    claimedAt: new Date(),
    externalOrderId: externalOrderId || undefined,
    paymentStatus: body.payment?.paymentStatus?.trim() || undefined,
    currency: body.payment?.currency?.trim() || undefined,
    amountTotal:
      typeof body.payment?.amountTotal === "number" && Number.isFinite(body.payment.amountTotal)
        ? body.payment.amountTotal
        : undefined,
    couponCode: body.payment?.couponCode?.trim() || undefined,
  });

  const street = normalizeListingAddressPart(body.property?.address);
  const city = normalizeListingAddressPart(body.property?.city);
  const state = normalizeListingAddressPart(body.property?.state);
  const zip = normalizeListingAddressPart(body.property?.zip);
  const unit = normalizeListingAddressPart(body.property?.unit);
  const county = normalizeListingAddressPart(body.property?.county);
  const rawPropertyType = body.property?.propertyType?.trim();

  let listingCreated = false;

  if (hasValidCoreListingAddress({ street, city, state, zip })) {
    const introDescription = buildIntroDescription(rawPropertyType, body.upgrades);
    const planLabel = planPrice ? `${planName} (${planPrice})` : planName!;

    if (externalOrderId) {
      const dup = await Listing.exists({ sourceOrderId: externalOrderId });
      if (!dup) {
        await Listing.create({
          userId: user._id,
          street,
          unit,
          city,
          state,
          zip,
          county,
          propertyType: listingPropertyType(rawPropertyType),
          status: "INCOMPLETE",
          planLabel,
          price: 0,
          description: introDescription,
          orderedOn: new Date(),
          sourceOrderId: externalOrderId,
        });
        listingCreated = true;
      }
    } else {
      await Listing.create({
        userId: user._id,
        street,
        unit,
        city,
        state,
        zip,
        county,
        propertyType: listingPropertyType(rawPropertyType),
        status: "INCOMPLETE",
        planLabel,
        price: 0,
        description: introDescription,
        orderedOn: new Date(),
      });
      listingCreated = true;
    }
  }

  const base = appBaseUrl();
  const setupAccountUrl =
    createdUser && setupSecretPlain && base
      ? `${base}/setup-account?token=${encodeURIComponent(setupSecretPlain)}`
      : undefined;

  return {
    status: "ok",
    linkedToUser: !createdUser,
    createdUser,
    setupAccountUrl,
    listingCreated,
  };
}
