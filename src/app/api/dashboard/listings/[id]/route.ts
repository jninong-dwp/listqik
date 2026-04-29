import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";

type PatchBody = {
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  price?: number;
  buyerAgentCompPct?: number | null;
  description?: string;
  status?: string;
  planLabel?: string;
  county?: string;
  mlsName?: string;
  mlsNumber?: string;
  listingId?: string;
  heroImageUrl?: string;
  listedOn?: string | null;
  expiresOn?: string | null;
  legalLot?: string;
  legalBlock?: string;
  legalAddition?: string;
  propertyType?: "SINGLE_FAMILY" | "CONDOMINIUM";
  parcelId?: string;
  sellerNames?: string;
  contactPhone?: string;
  contactEmail?: string;
  feeSimpleConfirmed?: boolean;
  tenantOccupied?: boolean;
  namedSubdivision?: boolean;
  subdivisionName?: string;
  associationType?: "HOA" | "CONDO" | "NONE";
  newConstruction?: boolean;
  septicSystem?: boolean;
  hasPool?: boolean;
  lockboxOrKeypad?: boolean;
  lockboxInstructions?: string;
  ownershipType?: "INDIVIDUAL" | "MARRIED_COUPLE" | "DECEASED_ESTATE" | "BUSINESS_ENTITY";
  allOwnersOccupyProperty?: boolean;
  businessEntityName?: string;
  businessEntityRegisteredName?: string;
  businessEntitySignerName?: string;
  businessEntitySignerTitle?: string;
  businessEntitySignerEmail?: string;
  allOwnersConsentEsign?: boolean;
  appointmentPhone?: string;
  appointmentPhoneCanText?: boolean;
  alternatePhone?: string;
  alternatePhoneCanText?: boolean;
  appointmentEmail?: string;
  listingStartOn?: string | null;
  listingEndOn?: string | null;
  flatFee?: number | null;
  protectionPeriodDays?: number | null;
  intermediaryStatusAuthorized?: boolean;
  buyerAgentCompType?: "PERCENT" | "AMOUNT";
  buyerAgentCompAmount?: number | null;
  exclusions?: string;
  hoaRequired?: boolean;
  improvementsAndAccessories?: string;
  publicRemarks?: string;
  privateRemarks?: string;
  drivingDirections?: string;
  crossStreet?: string;
  schedulingService?: string;
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
};

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
  hasPool?: boolean;
  lockboxOrKeypad?: boolean;
  lockboxInstructions?: string | null;
  ownershipType?: "INDIVIDUAL" | "MARRIED_COUPLE" | "DECEASED_ESTATE" | "BUSINESS_ENTITY" | null;
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
    hasPool: Boolean(doc.hasPool),
    lockboxOrKeypad: Boolean(doc.lockboxOrKeypad),
    lockboxInstructions: doc.lockboxInstructions ?? "",
    ownershipType: doc.ownershipType ?? "INDIVIDUAL",
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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, listing: serializeListing(listing) });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId });
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  const allowed = [
    "INCOMPLETE",
    "ACTIVE",
    "PENDING",
    "EXPIRED",
    "SOLD",
  ] as const;
  type Status = (typeof allowed)[number];

  if (body.price !== undefined) {
    if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0) {
      return NextResponse.json({ ok: false, error: "Invalid price." }, { status: 400 });
    }
    listing.price = Math.round(body.price);
  }
  if (body.street !== undefined) listing.street = body.street.trim();
  if (body.unit !== undefined) listing.unit = body.unit?.trim() || undefined;
  if (body.city !== undefined) listing.city = body.city.trim();
  if (body.state !== undefined) listing.state = body.state.trim();
  if (body.zip !== undefined) listing.zip = body.zip.trim();
  if (body.buyerAgentCompPct !== undefined) {
    listing.buyerAgentCompPct =
      body.buyerAgentCompPct === null ? null : Number(body.buyerAgentCompPct);
  }
  if (body.description !== undefined) {
    listing.description = String(body.description);
  }
  if (body.planLabel !== undefined) {
    listing.planLabel = body.planLabel?.trim() || undefined;
  }
  if (body.county !== undefined) {
    listing.county = body.county?.trim() || undefined;
  }
  if (body.mlsName !== undefined) {
    listing.mlsName = body.mlsName?.trim() || undefined;
  }
  if (body.mlsNumber !== undefined) {
    listing.mlsNumber = body.mlsNumber?.trim() || undefined;
  }
  if (body.listingId !== undefined) {
    listing.listingId = body.listingId?.trim() || undefined;
  }
  if (body.heroImageUrl !== undefined) {
    listing.heroImageUrl = body.heroImageUrl?.trim() || undefined;
  }
  if (body.status !== undefined) {
    if (!allowed.includes(body.status as Status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    listing.status = body.status as Status;
  }
  if (body.listedOn !== undefined) {
    listing.listedOn = body.listedOn ? new Date(body.listedOn) : null;
  }
  if (body.expiresOn !== undefined) {
    listing.expiresOn = body.expiresOn ? new Date(body.expiresOn) : null;
  }
  if (body.legalLot !== undefined) listing.legalLot = body.legalLot?.trim() || undefined;
  if (body.legalBlock !== undefined) listing.legalBlock = body.legalBlock?.trim() || undefined;
  if (body.legalAddition !== undefined) listing.legalAddition = body.legalAddition?.trim() || undefined;
  if (body.propertyType !== undefined) listing.propertyType = body.propertyType;
  if (body.parcelId !== undefined) listing.parcelId = body.parcelId?.trim() || undefined;
  if (body.sellerNames !== undefined) listing.sellerNames = body.sellerNames?.trim() || undefined;
  if (body.contactPhone !== undefined) listing.contactPhone = body.contactPhone?.trim() || undefined;
  if (body.contactEmail !== undefined) listing.contactEmail = body.contactEmail?.trim().toLowerCase() || undefined;
  if (body.feeSimpleConfirmed !== undefined) listing.feeSimpleConfirmed = Boolean(body.feeSimpleConfirmed);
  if (body.tenantOccupied !== undefined) listing.tenantOccupied = Boolean(body.tenantOccupied);
  if (body.namedSubdivision !== undefined) listing.namedSubdivision = Boolean(body.namedSubdivision);
  if (body.subdivisionName !== undefined) listing.subdivisionName = body.subdivisionName?.trim() || undefined;
  if (body.associationType !== undefined) listing.associationType = body.associationType;
  if (body.newConstruction !== undefined) listing.newConstruction = Boolean(body.newConstruction);
  if (body.septicSystem !== undefined) listing.septicSystem = Boolean(body.septicSystem);
  if (body.hasPool !== undefined) listing.hasPool = Boolean(body.hasPool);
  if (body.lockboxOrKeypad !== undefined) listing.lockboxOrKeypad = Boolean(body.lockboxOrKeypad);
  if (body.lockboxInstructions !== undefined) listing.lockboxInstructions = String(body.lockboxInstructions ?? "");
  if (body.ownershipType !== undefined) listing.ownershipType = body.ownershipType;
  if (body.allOwnersOccupyProperty !== undefined) {
    listing.allOwnersOccupyProperty = Boolean(body.allOwnersOccupyProperty);
  }
  if (body.businessEntityName !== undefined) listing.businessEntityName = body.businessEntityName?.trim() || undefined;
  if (body.businessEntityRegisteredName !== undefined) {
    listing.businessEntityRegisteredName = body.businessEntityRegisteredName?.trim() || undefined;
  }
  if (body.businessEntitySignerName !== undefined) {
    listing.businessEntitySignerName = body.businessEntitySignerName?.trim() || undefined;
  }
  if (body.businessEntitySignerTitle !== undefined) {
    listing.businessEntitySignerTitle = body.businessEntitySignerTitle?.trim() || undefined;
  }
  if (body.businessEntitySignerEmail !== undefined) {
    listing.businessEntitySignerEmail = body.businessEntitySignerEmail?.trim().toLowerCase() || undefined;
  }
  if (body.allOwnersConsentEsign !== undefined) listing.allOwnersConsentEsign = Boolean(body.allOwnersConsentEsign);
  if (body.appointmentPhone !== undefined) listing.appointmentPhone = body.appointmentPhone?.trim() || undefined;
  if (body.appointmentPhoneCanText !== undefined) {
    listing.appointmentPhoneCanText = Boolean(body.appointmentPhoneCanText);
  }
  if (body.alternatePhone !== undefined) listing.alternatePhone = body.alternatePhone?.trim() || undefined;
  if (body.alternatePhoneCanText !== undefined) {
    listing.alternatePhoneCanText = Boolean(body.alternatePhoneCanText);
  }
  if (body.appointmentEmail !== undefined) {
    listing.appointmentEmail = body.appointmentEmail?.trim().toLowerCase() || undefined;
  }
  if (body.listingStartOn !== undefined) listing.listingStartOn = body.listingStartOn ? new Date(body.listingStartOn) : null;
  if (body.listingEndOn !== undefined) listing.listingEndOn = body.listingEndOn ? new Date(body.listingEndOn) : null;
  if (body.flatFee !== undefined) listing.flatFee = body.flatFee === null ? null : Number(body.flatFee);
  if (body.protectionPeriodDays !== undefined) {
    listing.protectionPeriodDays = body.protectionPeriodDays === null ? null : Number(body.protectionPeriodDays);
  }
  if (body.intermediaryStatusAuthorized !== undefined) {
    listing.intermediaryStatusAuthorized = Boolean(body.intermediaryStatusAuthorized);
  }
  if (body.buyerAgentCompType !== undefined) listing.buyerAgentCompType = body.buyerAgentCompType;
  if (body.buyerAgentCompAmount !== undefined) {
    listing.buyerAgentCompAmount = body.buyerAgentCompAmount === null ? null : Number(body.buyerAgentCompAmount);
  }
  if (body.exclusions !== undefined) listing.exclusions = String(body.exclusions ?? "");
  if (body.hoaRequired !== undefined) listing.hoaRequired = Boolean(body.hoaRequired);
  if (body.improvementsAndAccessories !== undefined) {
    listing.improvementsAndAccessories = String(body.improvementsAndAccessories ?? "");
  }
  if (body.publicRemarks !== undefined) listing.publicRemarks = String(body.publicRemarks ?? "");
  if (body.privateRemarks !== undefined) listing.privateRemarks = String(body.privateRemarks ?? "");
  if (body.drivingDirections !== undefined) listing.drivingDirections = String(body.drivingDirections ?? "");
  if (body.crossStreet !== undefined) listing.crossStreet = body.crossStreet?.trim() || undefined;
  if (body.schedulingService !== undefined) listing.schedulingService = body.schedulingService?.trim() || undefined;
  if (body.keyboxPermission !== undefined) listing.keyboxPermission = Boolean(body.keyboxPermission);
  if (body.keyboxRiskAcknowledged !== undefined) listing.keyboxRiskAcknowledged = Boolean(body.keyboxRiskAcknowledged);
  if (body.firstPhotoExteriorConfirmed !== undefined) {
    listing.firstPhotoExteriorConfirmed = Boolean(body.firstPhotoExteriorConfirmed);
  }
  if (body.photoNoSignsConfirmed !== undefined) listing.photoNoSignsConfirmed = Boolean(body.photoNoSignsConfirmed);
  if (body.photoNoPeoplePetsConfirmed !== undefined) {
    listing.photoNoPeoplePetsConfirmed = Boolean(body.photoNoPeoplePetsConfirmed);
  }
  if (body.photoCopyrightConfirmed !== undefined) listing.photoCopyrightConfirmed = Boolean(body.photoCopyrightConfirmed);
  if (body.yearBuilt !== undefined) listing.yearBuilt = body.yearBuilt === null ? null : Number(body.yearBuilt);
  if (body.isInMudWaterDistrict !== undefined) listing.isInMudWaterDistrict = Boolean(body.isInMudWaterDistrict);
  if (body.fairHousingNoticeConfirmed !== undefined) {
    listing.fairHousingNoticeConfirmed = Boolean(body.fairHousingNoticeConfirmed);
  }
  if (body.valuablesNoticeConfirmed !== undefined) {
    listing.valuablesNoticeConfirmed = Boolean(body.valuablesNoticeConfirmed);
  }
  if (body.iabsAcknowledged !== undefined) listing.iabsAcknowledged = Boolean(body.iabsAcknowledged);
  if (body.sellersDisclosureAcknowledged !== undefined) {
    listing.sellersDisclosureAcknowledged = Boolean(body.sellersDisclosureAcknowledged);
  }
  if (body.listingAgreementAcknowledged !== undefined) {
    listing.listingAgreementAcknowledged = Boolean(body.listingAgreementAcknowledged);
  }
  if (body.brokerBrandingConfirmed !== undefined) {
    listing.brokerBrandingConfirmed = Boolean(body.brokerBrandingConfirmed);
  }
  if (body.informationAccurateConfirmed !== undefined) {
    listing.informationAccurateConfirmed = Boolean(body.informationAccurateConfirmed);
  }
  if (body.referredByExistingCustomer !== undefined) {
    listing.referredByExistingCustomer = Boolean(body.referredByExistingCustomer);
  }
  if (body.wantsListingProcessFeedback !== undefined) {
    listing.wantsListingProcessFeedback = Boolean(body.wantsListingProcessFeedback);
  }

  await listing.save();
  return NextResponse.json({ ok: true });
}
