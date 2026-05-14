import { hasMeaningfulListingAddressText } from "@/lib/listing-address";
import { normalizeListingPlatforms } from "@/lib/listing-platforms";

type ListingForCompliance = {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  county?: string | null;
  price?: number | null;
  buyerAgentCompPct?: number | null;
  buyerAgentCompType?: "PERCENT" | "AMOUNT" | null;
  buyerAgentCompAmount?: number | null;
  description?: string | null;
  publicRemarks?: string | null;
  privateRemarks?: string | null;
  drivingDirections?: string | null;
  heroImageUrl?: string | null;
  mlsName?: string | null;
  mlsNumber?: string | null;
  listingId?: string | null;
  listingPlatforms?: unknown;
  legalLot?: string | null;
  legalBlock?: string | null;
  legalAddition?: string | null;
  legalDescription?: string | null;
  parcelId?: string | null;
  propertyType?: "SINGLE_FAMILY" | "CONDOMINIUM" | null;
  namedSubdivision?: boolean;
  subdivisionName?: string | null;
  associationType?: "HOA" | "CONDO" | "NONE" | null;
  sellerNames?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  feeSimpleConfirmed?: boolean;
  tenantOccupied?: boolean;
  ownershipType?:
    | "INDIVIDUAL"
    | "MARRIED_COUPLE"
    | "DECEASED_ESTATE"
    | "BUSINESS_ENTITY"
    | "POWER_OF_ATTORNEY"
    | null;
  businessEntityName?: string | null;
  businessEntityRegisteredName?: string | null;
  businessEntitySignerName?: string | null;
  businessEntitySignerTitle?: string | null;
  businessEntitySignerEmail?: string | null;
  allOwnersConsentEsign?: boolean;
  appointmentPhone?: string | null;
  appointmentEmail?: string | null;
  listingStartOn?: Date | string | null;
  intermediaryStatusAuthorized?: boolean;
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
  securitySurveillanceAcknowledged?: boolean;
  iabsAcknowledged?: boolean;
  sellersDisclosureAcknowledged?: boolean;
  brokerBrandingConfirmed?: boolean;
  informationAccurateConfirmed?: boolean;
  allOwnersOccupyProperty?: boolean;
  lockboxOrKeypad?: boolean;
};

function hasText(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

function hasDate(value?: Date | string | null) {
  if (!value) return false;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isFinite(d.getTime());
}

export function validateListingForFinalize(listing: ListingForCompliance) {
  const errors: string[] = [];

  if (!hasMeaningfulListingAddressText(listing.street)) errors.push("Street is required.");
  if (!hasMeaningfulListingAddressText(listing.city)) errors.push("City is required.");
  if (!hasMeaningfulListingAddressText(listing.state)) errors.push("State is required.");
  if (!hasMeaningfulListingAddressText(listing.zip)) errors.push("ZIP is required.");
  if (!hasText(listing.county)) errors.push("County is required.");
  const legalStructured =
    hasText(listing.legalLot) && hasText(listing.legalBlock) && hasText(listing.legalAddition);
  const legalFromDescription = hasText(listing.legalDescription);
  if (!legalStructured && !legalFromDescription) {
    errors.push("Legal description (full text) or legal lot, block, and addition is required.");
  }

  if (typeof listing.price !== "number" || !Number.isFinite(listing.price) || listing.price <= 0) {
    errors.push("Valid list price is required.");
  }
  if (!hasDate(listing.listingStartOn)) errors.push("Listing start date is required.");
  if (!listing.intermediaryStatusAuthorized) errors.push("Intermediary status authorization is required.");

  if (listing.buyerAgentCompType === "AMOUNT") {
    if (
      typeof listing.buyerAgentCompAmount !== "number" ||
      !Number.isFinite(listing.buyerAgentCompAmount) ||
      listing.buyerAgentCompAmount <= 0
    ) {
      errors.push("Valid buyer-agent compensation amount is required.");
    }
  } else if (listing.buyerAgentCompPct === null || listing.buyerAgentCompPct === undefined) {
    errors.push("Buyer-agent compensation percent is required.");
  }

  if ((listing.description ?? "").trim().length < 40) {
    errors.push("Description must be at least 40 characters.");
  }
  if ((listing.publicRemarks ?? "").trim().length < 20) {
    errors.push("Public remarks must be at least 20 characters.");
  }

  if (!hasText(listing.heroImageUrl)) errors.push("Hero image is required.");
  if (!listing.firstPhotoExteriorConfirmed) errors.push("Photo compliance: first photo must be exterior.");
  if (!listing.photoNoSignsConfirmed) errors.push("Photo compliance: no signs/branding must be confirmed.");
  if (!listing.photoNoPeoplePetsConfirmed) errors.push("Photo compliance: no people/pets must be confirmed.");
  if (!listing.photoCopyrightConfirmed) errors.push("Photo compliance: rights confirmation is required.");

  const platforms = normalizeListingPlatforms(listing.listingPlatforms);
  if (platforms.length === 0) {
    errors.push("Select at least one place you would like to list your property.");
  }

  if (!hasText(listing.sellerNames)) errors.push("Seller legal names are required.");
  if (!hasText(listing.contactPhone)) errors.push("Primary contact phone is required.");
  if (!hasText(listing.contactEmail)) errors.push("Primary contact email is required.");
  if (!hasText(listing.appointmentPhone)) errors.push("Appointment phone is required.");
  if (!hasText(listing.appointmentEmail)) errors.push("Appointment email is required.");
  if (!listing.feeSimpleConfirmed) errors.push("Fee simple title confirmation is required.");
  if (!listing.allOwnersConsentEsign) errors.push("Owner e-sign consent is required.");

  if (listing.ownershipType === "BUSINESS_ENTITY") {
    if (!hasText(listing.businessEntityName)) errors.push("Business entity name is required.");
    if (!hasText(listing.businessEntityRegisteredName)) errors.push("Business registered legal name is required.");
    if (!hasText(listing.businessEntitySignerName)) errors.push("Business signer name is required.");
    if (!hasText(listing.businessEntitySignerTitle)) errors.push("Business signer title is required.");
    if (!hasText(listing.businessEntitySignerEmail)) errors.push("Business signer email is required.");
  }

  if (listing.namedSubdivision && !hasText(listing.subdivisionName)) {
    errors.push("Subdivision/condo name is required when subdivision is selected.");
  }

  if (listing.propertyType === "CONDOMINIUM" || listing.associationType === "CONDO") {
    errors.push("Condo addendum required: upload signed condo addendum in Documents.");
  }
  if ((listing.yearBuilt ?? 0) > 0 && (listing.yearBuilt ?? 0) < 1978) {
    errors.push("Lead-based paint disclosure required for homes built before 1978.");
  }
  if (listing.tenantOccupied) {
    errors.push("Tenant authorization disclosure required for tenant-occupied properties.");
  }
  if (listing.lockboxOrKeypad) {
    if (!listing.keyboxPermission) errors.push("Keybox permission is required.");
    if (!listing.keyboxRiskAcknowledged) errors.push("Keybox risk acknowledgment is required.");
  }
  if (listing.isInMudWaterDistrict) {
    errors.push("MUD/water district notice required: upload district notice document.");
  }

  if (!listing.fairHousingNoticeConfirmed) errors.push("Fair housing notice confirmation is required.");
  if (!listing.valuablesNoticeConfirmed) errors.push("Valuables/security notice confirmation is required.");
  if (!listing.securitySurveillanceAcknowledged) {
    errors.push("Security & surveillance notice acknowledgment is required.");
  }
  if (!listing.iabsAcknowledged) errors.push("IABS acknowledgment is required.");
  if (!listing.sellersDisclosureAcknowledged) errors.push("Seller disclosure acknowledgment is required.");
  if (!listing.brokerBrandingConfirmed) errors.push("Broker branding compliance confirmation is required.");
  if (!listing.informationAccurateConfirmed) errors.push("Accuracy attestation is required.");

  return errors;
}
