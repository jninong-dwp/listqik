import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Types } from "mongoose";
import { Types as MongooseTypes } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { getEffectivePlanAccessForUser } from "@/lib/plan-access";
import {
  hasValidCoreListingAddress,
  normalizeListingAddressPart,
} from "@/lib/listing-address";
import { normalizeListingPlatforms } from "@/lib/listing-platforms";
import { Listing } from "@/models/Listing";

function iso(d: unknown): string | null {
  if (!d) {
    return null;
  }
  if (d instanceof Date) {
    return d.toISOString();
  }
  const t = new Date(String(d));
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

function serializeListing(doc: {
  _id: Types.ObjectId;
  street: string;
  unit?: string | null;
  city: string;
  state: string;
  zip: string;
  county?: string | null;
  legalLot?: string | null;
  legalBlock?: string | null;
  legalAddition?: string | null;
  legalDescription?: string | null;
  propertyType?: "SINGLE_FAMILY" | "CONDOMINIUM" | null;
  parcelId?: string | null;
  sellerNames?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  feeSimpleConfirmed?: boolean;
  tenantOccupied?: boolean;
  namedSubdivision?: boolean;
  subdivisionName?: string | null;
  associationType?: "HOA" | "CONDO" | "NONE" | null;
  newConstruction?: boolean;
  septicSystem?: boolean;
  hasSolarSystem?: boolean;
  hasPool?: boolean;
  lockboxOrKeypad?: boolean;
  lockboxInstructions?: string | null;
  ownershipType?:
    | "INDIVIDUAL"
    | "MARRIED_COUPLE"
    | "DECEASED_ESTATE"
    | "BUSINESS_ENTITY"
    | "POWER_OF_ATTORNEY"
    | null;
  allSignersUsCitizens?: boolean;
  anyOwnerLicensedAgent?: boolean;
  allOwnersOccupyProperty?: boolean;
  businessEntityName?: string | null;
  businessEntityRegisteredName?: string | null;
  businessEntitySignerName?: string | null;
  businessEntitySignerTitle?: string | null;
  businessEntitySignerEmail?: string | null;
  allOwnersConsentEsign?: boolean;
  appointmentPhone?: string | null;
  appointmentPhoneCanText?: boolean;
  alternatePhone?: string | null;
  alternatePhoneCanText?: boolean;
  appointmentEmail?: string | null;
  mlsName?: string | null;
  mlsNumber?: string | null;
  listingId?: string | null;
  status: string;
  planLabel?: string | null;
  price: number;
  buyerAgentCompPct?: number | null;
  description?: string | null;
  listingStartOn?: Date | null;
  listingEndOn?: Date | null;
  flatFee?: number | null;
  protectionPeriodDays?: number | null;
  intermediaryStatusAuthorized?: boolean;
  buyerAgentCompType?: "PERCENT" | "AMOUNT" | null;
  buyerAgentCompAmount?: number | null;
  exclusions?: string | null;
  hoaRequired?: boolean;
  improvementsAndAccessories?: string | null;
  publicRemarks?: string | null;
  privateRemarks?: string | null;
  drivingDirections?: string | null;
  crossStreet?: string | null;
  schedulingService?: string | null;
  keyboxPermission?: boolean;
  keyboxRiskAcknowledged?: boolean;
  firstPhotoExteriorConfirmed?: boolean;
  photoNoSignsConfirmed?: boolean;
  photoNoPeoplePetsConfirmed?: boolean;
  photoCopyrightConfirmed?: boolean;
  yearBuilt?: number | null;
  isInMudWaterDistrict?: boolean;
  fairHousingNoticeConfirmed?: boolean;
  valuablesNoticeConfirmed?: boolean;
  iabsAcknowledged?: boolean;
  sellersDisclosureAcknowledged?: boolean;
  listingAgreementAcknowledged?: boolean;
  brokerBrandingConfirmed?: boolean;
  informationAccurateConfirmed?: boolean;
  referredByExistingCustomer?: boolean;
  wantsListingProcessFeedback?: boolean;
  listingPlatforms?: string[];
  additionalPhotoUrls?: string[];
  heroImageUrl?: string | null;
  orderedOn?: Date | null;
  listedOn?: Date | null;
  expiresOn?: Date | null;
  setupFinalizedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}) {
  return {
    id: doc._id.toString(),
    street: doc.street,
    unit: doc.unit ?? "",
    city: doc.city,
    state: doc.state,
    zip: doc.zip,
    county: doc.county ?? "",
    legalLot: doc.legalLot ?? "",
    legalBlock: doc.legalBlock ?? "",
    legalAddition: doc.legalAddition ?? "",
    legalDescription: doc.legalDescription ?? "",
    propertyType: doc.propertyType ?? "SINGLE_FAMILY",
    parcelId: doc.parcelId ?? "",
    sellerNames: doc.sellerNames ?? "",
    contactPhone: doc.contactPhone ?? "",
    contactEmail: doc.contactEmail ?? "",
    feeSimpleConfirmed: Boolean(doc.feeSimpleConfirmed),
    tenantOccupied: Boolean(doc.tenantOccupied),
    namedSubdivision: Boolean(doc.namedSubdivision),
    subdivisionName: doc.subdivisionName ?? "",
    associationType: doc.associationType ?? "NONE",
    newConstruction: Boolean(doc.newConstruction),
    septicSystem: Boolean(doc.septicSystem),
    hasSolarSystem: Boolean(doc.hasSolarSystem),
    hasPool: Boolean(doc.hasPool),
    lockboxOrKeypad: Boolean(doc.lockboxOrKeypad),
    lockboxInstructions: doc.lockboxInstructions ?? "",
    ownershipType: doc.ownershipType ?? "INDIVIDUAL",
    allSignersUsCitizens: Boolean(doc.allSignersUsCitizens ?? true),
    anyOwnerLicensedAgent: Boolean(doc.anyOwnerLicensedAgent),
    allOwnersOccupyProperty: Boolean(doc.allOwnersOccupyProperty),
    businessEntityName: doc.businessEntityName ?? "",
    businessEntityRegisteredName: doc.businessEntityRegisteredName ?? "",
    businessEntitySignerName: doc.businessEntitySignerName ?? "",
    businessEntitySignerTitle: doc.businessEntitySignerTitle ?? "",
    businessEntitySignerEmail: doc.businessEntitySignerEmail ?? "",
    allOwnersConsentEsign: Boolean(doc.allOwnersConsentEsign),
    appointmentPhone: doc.appointmentPhone ?? "",
    appointmentPhoneCanText: Boolean(doc.appointmentPhoneCanText),
    alternatePhone: doc.alternatePhone ?? "",
    alternatePhoneCanText: Boolean(doc.alternatePhoneCanText),
    appointmentEmail: doc.appointmentEmail ?? "",
    mlsName: doc.mlsName ?? "",
    mlsNumber: doc.mlsNumber ?? "",
    listingId: doc.listingId ?? "",
    listingPlatforms: normalizeListingPlatforms((doc as { listingPlatforms?: unknown }).listingPlatforms),
    additionalPhotoUrls: (() => {
      const raw = (doc as { additionalPhotoUrls?: unknown }).additionalPhotoUrls;
      if (!Array.isArray(raw)) return [];
      return raw
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
        .map((u) => u.trim())
        .slice(0, 40);
    })(),
    status: doc.status,
    planLabel: doc.planLabel ?? "",
    price: doc.price,
    buyerAgentCompPct: doc.buyerAgentCompPct ?? null,
    description: doc.description ?? "",
    listingStartOn: iso(doc.listingStartOn),
    listingEndOn: iso(doc.listingEndOn),
    flatFee: doc.flatFee ?? null,
    protectionPeriodDays: doc.protectionPeriodDays ?? null,
    intermediaryStatusAuthorized: Boolean(doc.intermediaryStatusAuthorized),
    buyerAgentCompType: doc.buyerAgentCompType ?? "PERCENT",
    buyerAgentCompAmount: doc.buyerAgentCompAmount ?? null,
    exclusions: doc.exclusions ?? "",
    hoaRequired: Boolean(doc.hoaRequired),
    improvementsAndAccessories: doc.improvementsAndAccessories ?? "",
    publicRemarks: doc.publicRemarks ?? "",
    privateRemarks: doc.privateRemarks ?? "",
    drivingDirections: doc.drivingDirections ?? "",
    crossStreet: doc.crossStreet ?? "",
    schedulingService: doc.schedulingService ?? "",
    keyboxPermission: Boolean(doc.keyboxPermission),
    keyboxRiskAcknowledged: Boolean(doc.keyboxRiskAcknowledged),
    firstPhotoExteriorConfirmed: Boolean(doc.firstPhotoExteriorConfirmed),
    photoNoSignsConfirmed: Boolean(doc.photoNoSignsConfirmed),
    photoNoPeoplePetsConfirmed: Boolean(doc.photoNoPeoplePetsConfirmed),
    photoCopyrightConfirmed: Boolean(doc.photoCopyrightConfirmed),
    yearBuilt: doc.yearBuilt ?? null,
    isInMudWaterDistrict: Boolean(doc.isInMudWaterDistrict),
    fairHousingNoticeConfirmed: Boolean(doc.fairHousingNoticeConfirmed),
    valuablesNoticeConfirmed: Boolean(doc.valuablesNoticeConfirmed),
    iabsAcknowledged: Boolean(doc.iabsAcknowledged),
    sellersDisclosureAcknowledged: Boolean(doc.sellersDisclosureAcknowledged),
    listingAgreementAcknowledged: Boolean(doc.listingAgreementAcknowledged),
    brokerBrandingConfirmed: Boolean(doc.brokerBrandingConfirmed),
    informationAccurateConfirmed: Boolean(doc.informationAccurateConfirmed),
    referredByExistingCustomer: Boolean(doc.referredByExistingCustomer),
    wantsListingProcessFeedback: Boolean(doc.wantsListingProcessFeedback),
    heroImageUrl: doc.heroImageUrl ?? "",
    orderedOn: iso(doc.orderedOn),
    listedOn: iso(doc.listedOn),
    expiresOn: iso(doc.expiresOn),
    setupFinalizedAt: iso(doc.setupFinalizedAt),
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  await connectDb();
  const userId = new MongooseTypes.ObjectId(session.user.id);
  const effectivePlan = await getEffectivePlanAccessForUser(userId);
  const rows = await Listing.find({ userId }).sort({ updatedAt: -1 }).lean();
  const listings = rows
    .filter((r) =>
      hasValidCoreListingAddress({
        street: r.street,
        city: r.city,
        state: r.state,
        zip: r.zip,
      }),
    )
    .map((r) => serializeListing(r));
  return NextResponse.json({
    ok: true,
    effectivePlan,
    listings,
  });
}

type CreateBody = {
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  planLabel?: string;
  price?: number;
  description?: string;
  heroImageUrl?: string;
  propertyType?: "SINGLE_FAMILY" | "CONDOMINIUM";
  legalLot?: string;
  legalBlock?: string;
  legalAddition?: string;
  parcelId?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const street = normalizeListingAddressPart(body.street);
  const city = normalizeListingAddressPart(body.city);
  const state = normalizeListingAddressPart(body.state);
  const zip = normalizeListingAddressPart(body.zip);
  const unit = normalizeListingAddressPart(body.unit);
  const price = body.price;

  if (
    !hasValidCoreListingAddress({ street, city, state, zip }) ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "A real street, city, state, and ZIP are required (placeholders like \"null\" are not allowed).",
      },
      { status: 400 },
    );
  }

  await connectDb();
  const userId = new MongooseTypes.ObjectId(session.user.id);
  const effectivePlan = await getEffectivePlanAccessForUser(userId);
  if (!effectivePlan.entitlements.hasActivePlan) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No active listing plan on this account. Complete checkout first, or ensure your purchase webhook used the same email.",
      },
      { status: 403 },
    );
  }

  const doc = await Listing.create({
    userId,
    street,
    unit,
    city,
    state,
    zip,
    county: body.county?.trim(),
    propertyType: body.propertyType ?? "SINGLE_FAMILY",
    legalLot: body.legalLot?.trim(),
    legalBlock: body.legalBlock?.trim(),
    legalAddition: body.legalAddition?.trim(),
    parcelId: body.parcelId?.trim(),
    planLabel: body.planLabel?.trim(),
    price: Math.round(price),
    description: body.description?.trim() ?? "",
    heroImageUrl: body.heroImageUrl?.trim(),
    orderedOn: new Date(),
  });

  const saved = await Listing.findById(doc._id).lean();
  if (!saved) {
    return NextResponse.json({ ok: false, error: "Failed to load listing." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, listing: serializeListing(saved) });
}
