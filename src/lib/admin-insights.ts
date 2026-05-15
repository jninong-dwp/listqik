import { hasMeaningfulListingAddressText } from "@/lib/listing-address";
import { normalizeListingPlatforms } from "@/lib/listing-platforms";
import { validateListingForFinalize } from "@/lib/listing-compliance";

export type ListingInsightInput = {
  _id?: unknown;
  userId?: unknown;
  street?: string | null;
  unit?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  county?: string | null;
  legalLot?: string | null;
  legalBlock?: string | null;
  legalAddition?: string | null;
  legalDescription?: string | null;
  propertyType?: "SINGLE_FAMILY" | "CONDOMINIUM" | null;
  parcelId?: string | null;
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
  buyerAgentCompType?: "PERCENT" | "AMOUNT" | null;
  buyerAgentCompPct?: number | null;
  buyerAgentCompAmount?: number | null;
  description?: string | null;
  publicRemarks?: string | null;
  heroImageUrl?: string | null;
  listingPlatforms?: unknown;
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
  lockboxOrKeypad?: boolean;
  keyboxPermission?: boolean;
  keyboxRiskAcknowledged?: boolean;
  status?: string | null;
  planLabel?: string | null;
  price?: number | null;
  setupFinalizedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
};

export type UserInsightInput = {
  _id?: unknown;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  passwordSetupTokenSha256?: string | null;
  passwordSetupExpiresAt?: Date | string | null;
  userAgreementAcknowledgedAt?: Date | string | null;
};

export type ActivityEvent = {
  id: string;
  sortAt: number;
  atLabel: string;
  title: string;
  detail?: string;
  tone?: "default" | "success" | "warning" | "info";
};

function hasText(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

function legalComplete(l: ListingInsightInput): boolean {
  const structured =
    hasText(l.legalLot) && hasText(l.legalBlock) && hasText(l.legalAddition);
  return structured || hasText(l.legalDescription);
}

function generalComplete(l: ListingInsightInput): boolean {
  const addr =
    hasMeaningfulListingAddressText(l.street) &&
    hasMeaningfulListingAddressText(l.city) &&
    hasMeaningfulListingAddressText(l.state) &&
    hasMeaningfulListingAddressText(l.zip);
  const yb = typeof l.yearBuilt === "number" && l.yearBuilt >= 1600 && l.yearBuilt <= 2100;
  return addr && yb && legalComplete(l);
}

function contactComplete(l: ListingInsightInput): boolean {
  const base =
    hasText(l.county) &&
    hasText(l.sellerNames) &&
    hasText(l.contactPhone) &&
    hasText(l.contactEmail) &&
    hasText(l.appointmentPhone) &&
    hasText(l.appointmentEmail) &&
    Boolean(l.feeSimpleConfirmed) &&
    Boolean(l.allOwnersConsentEsign);

  if (l.ownershipType === "BUSINESS_ENTITY") {
    return (
      base &&
      hasText(l.businessEntityName) &&
      hasText(l.businessEntityRegisteredName) &&
      hasText(l.businessEntitySignerName) &&
      hasText(l.businessEntitySignerTitle) &&
      hasText(l.businessEntitySignerEmail)
    );
  }
  return base;
}

function priceComplete(l: ListingInsightInput): boolean {
  return (
    typeof l.price === "number" &&
    l.price > 0 &&
    (l.buyerAgentCompType === "AMOUNT"
      ? typeof l.buyerAgentCompAmount === "number" && l.buyerAgentCompAmount > 0
      : l.buyerAgentCompPct !== null && l.buyerAgentCompPct !== undefined)
  );
}

function descriptionComplete(l: ListingInsightInput): boolean {
  return Math.max((l.publicRemarks ?? "").trim().length, (l.description ?? "").trim().length) >= 40;
}

function photosComplete(l: ListingInsightInput): boolean {
  return (
    hasText(l.heroImageUrl) &&
    Boolean(l.firstPhotoExteriorConfirmed) &&
    Boolean(l.photoNoSignsConfirmed) &&
    Boolean(l.photoNoPeoplePetsConfirmed) &&
    Boolean(l.photoCopyrightConfirmed)
  );
}

function disclosuresComplete(l: ListingInsightInput): boolean {
  return (
    Boolean(l.fairHousingNoticeConfirmed) &&
    Boolean(l.valuablesNoticeConfirmed) &&
    Boolean(l.securitySurveillanceAcknowledged) &&
    Boolean(l.iabsAcknowledged) &&
    Boolean(l.sellersDisclosureAcknowledged) &&
    Boolean(l.brokerBrandingConfirmed) &&
    Boolean(l.informationAccurateConfirmed) &&
    Boolean(l.intermediaryStatusAuthorized) &&
    Boolean(l.listingStartOn)
  );
}

export function estimateSetupProgress(l: ListingInsightInput): { completed: number; total: number; pct: number } {
  const steps = [
    generalComplete(l),
    contactComplete(l),
    priceComplete(l),
    descriptionComplete(l),
    photosComplete(l),
    disclosuresComplete(l),
  ];
  const completed = steps.filter(Boolean).length;
  const total = steps.length;
  return { completed, total, pct: Math.round((completed / total) * 100) };
}

function docMatches(fileName: string, patterns: RegExp[]) {
  const lower = fileName.toLowerCase();
  return patterns.some((p) => p.test(lower));
}

export function getListingBlockers(
  listing: ListingInsightInput,
  documentFileNames: string[] = [],
): string[] {
  const errors = [...validateListingForFinalize(listing)];

  if (
    (listing.propertyType === "CONDOMINIUM" || listing.associationType === "CONDO") &&
    !documentFileNames.some((n) => docMatches(n, [/condo/, /addendum/]))
  ) {
    if (!errors.some((e) => e.includes("Condo addendum"))) {
      errors.push("Condo addendum document not uploaded.");
    }
  }
  if ((listing.yearBuilt ?? 0) > 0 && (listing.yearBuilt ?? 0) < 1978) {
    if (!documentFileNames.some((n) => docMatches(n, [/lead/, /paint/]))) {
      if (!errors.some((e) => e.includes("Lead-based paint"))) {
        errors.push("Lead-based paint document not uploaded.");
      }
    }
  }
  if (listing.tenantOccupied) {
    if (!documentFileNames.some((n) => docMatches(n, [/tenant/, /authorization/]))) {
      if (!errors.some((e) => e.includes("Tenant authorization"))) {
        errors.push("Tenant authorization document not uploaded.");
      }
    }
  }
  if (listing.isInMudWaterDistrict) {
    if (!documentFileNames.some((n) => docMatches(n, [/mud/, /water/, /district/, /notice/]))) {
      if (!errors.some((e) => e.includes("MUD/water"))) {
        errors.push("MUD/water district document not uploaded.");
      }
    }
  }

  const platforms = normalizeListingPlatforms(listing.listingPlatforms);
  if (platforms.length === 0 && !errors.some((e) => e.includes("place you would like to list"))) {
    errors.push("No marketing platforms selected.");
  }

  return errors;
}

export function formatAdminDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAdminDay(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export function listingAddressShort(l: ListingInsightInput): string {
  const parts = [
    l.street,
    l.unit ? `#${l.unit}` : "",
    l.city,
    [l.state, l.zip].filter(Boolean).join(" "),
  ].filter((p) => typeof p === "string" && p.trim().length > 0);
  return parts.join(", ") || "No address";
}

export function userAccountStatus(user: UserInsightInput): {
  label: string;
  tone: "ok" | "warn" | "neutral";
} {
  const now = Date.now();
  if (user.passwordSetupTokenSha256) {
    const exp = user.passwordSetupExpiresAt
      ? new Date(user.passwordSetupExpiresAt).getTime()
      : NaN;
    if (Number.isFinite(exp) && exp > now) {
      return { label: "Password setup pending", tone: "warn" };
    }
    if (Number.isFinite(exp) && exp <= now) {
      return { label: "Setup link expired", tone: "warn" };
    }
    return { label: "Password setup pending", tone: "warn" };
  }
  if (!user.userAgreementAcknowledgedAt) {
    return { label: "Agreement not acknowledged", tone: "warn" };
  }
  return { label: "Active account", tone: "ok" };
}

export function buildUserActivityTimeline(input: {
  user: UserInsightInput;
  listings: ListingInsightInput[];
  plans: Array<{
    planName?: string;
    planId?: string;
    purchasedAt?: Date | string | null;
    createdAt?: Date | string | null;
  }>;
  upgradePurchases: Array<{
    upgradeSlugs?: string[];
    purchasedAt?: Date | string | null;
    createdAt?: Date | string | null;
    amountTotal?: number | null;
  }>;
  offers: Array<{
    buyerName?: string;
    amount?: number;
    status?: string;
    createdAt?: Date | string | null;
  }>;
  documents: Array<{ fileName?: string; createdAt?: Date | string | null }>;
  upgradeRequests: Array<{
    upgradeName?: string;
    status?: string;
    createdAt?: Date | string | null;
  }>;
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const { user } = input;

  if (user.createdAt) {
    events.push({
      id: "user-created",
      sortAt: new Date(user.createdAt).getTime(),
      atLabel: formatAdminDate(user.createdAt),
      title: "Account created",
      detail: user.email ?? undefined,
      tone: "info",
    });
  }

  if (user.userAgreementAcknowledgedAt) {
    events.push({
      id: "user-agreement",
      sortAt: new Date(user.userAgreementAcknowledgedAt).getTime(),
      atLabel: formatAdminDate(user.userAgreementAcknowledgedAt),
      title: "User agreement acknowledged",
      tone: "success",
    });
  }

  if (user.passwordSetupTokenSha256 && user.passwordSetupExpiresAt) {
    events.push({
      id: "password-setup",
      sortAt: new Date(user.passwordSetupExpiresAt).getTime(),
      atLabel: formatAdminDate(user.passwordSetupExpiresAt),
      title: "Password setup link issued",
      detail: userAccountStatus(user).label,
      tone: "warning",
    });
  }

  for (const plan of input.plans) {
    const at = plan.purchasedAt ?? plan.createdAt;
    if (!at) continue;
    events.push({
      id: `plan-${plan.planId}-${new Date(at).getTime()}`,
      sortAt: new Date(at).getTime(),
      atLabel: formatAdminDate(at),
      title: `Plan purchased: ${plan.planName || plan.planId || "Plan"}`,
      tone: "success",
    });
  }

  for (const up of input.upgradePurchases) {
    const at = up.purchasedAt ?? up.createdAt;
    if (!at) continue;
    const slugs = (up.upgradeSlugs ?? []).filter(Boolean).join(", ");
    events.push({
      id: `upgrade-purchase-${new Date(at).getTime()}-${slugs}`,
      sortAt: new Date(at).getTime(),
      atLabel: formatAdminDate(at),
      title: "Upgrade purchase",
      detail: slugs || (typeof up.amountTotal === "number" ? `$${up.amountTotal}` : undefined),
      tone: "success",
    });
  }

  for (const listing of input.listings) {
    const id = String(listing._id ?? "");
    if (listing.createdAt) {
      events.push({
        id: `listing-created-${id}`,
        sortAt: new Date(listing.createdAt).getTime(),
        atLabel: formatAdminDate(listing.createdAt),
        title: "Listing created",
        detail: listingAddressShort(listing),
        tone: "info",
      });
    }
    if (listing.setupFinalizedAt) {
      events.push({
        id: `listing-finalized-${id}`,
        sortAt: new Date(listing.setupFinalizedAt).getTime(),
        atLabel: formatAdminDate(listing.setupFinalizedAt),
        title: `Listing setup finalized (${listing.status ?? "—"})`,
        detail: listingAddressShort(listing),
        tone: "success",
      });
    }
    if (listing.updatedAt) {
      events.push({
        id: `listing-updated-${id}-${new Date(listing.updatedAt).getTime()}`,
        sortAt: new Date(listing.updatedAt).getTime(),
        atLabel: formatAdminDate(listing.updatedAt),
        title: "Listing updated",
        detail: `${listing.status ?? "—"} · ${listingAddressShort(listing)}`,
        tone: "default",
      });
    }
  }

  for (const doc of input.documents) {
    if (!doc.createdAt || !doc.fileName) continue;
    events.push({
      id: `doc-${doc.fileName}-${new Date(doc.createdAt).getTime()}`,
      sortAt: new Date(doc.createdAt).getTime(),
      atLabel: formatAdminDate(doc.createdAt),
      title: "Document uploaded",
      detail: doc.fileName,
      tone: "info",
    });
  }

  for (const offer of input.offers) {
    if (!offer.createdAt) continue;
    events.push({
      id: `offer-${offer.buyerName}-${new Date(offer.createdAt).getTime()}`,
      sortAt: new Date(offer.createdAt).getTime(),
      atLabel: formatAdminDate(offer.createdAt),
      title: `Buyer offer: ${offer.buyerName ?? "Unknown"}`,
      detail: [
        typeof offer.amount === "number" ? `$${offer.amount.toLocaleString()}` : "",
        offer.status ?? "",
      ]
        .filter(Boolean)
        .join(" · "),
      tone: "info",
    });
  }

  for (const req of input.upgradeRequests) {
    if (!req.createdAt) continue;
    events.push({
      id: `upgrade-req-${req.upgradeName}-${new Date(req.createdAt).getTime()}`,
      sortAt: new Date(req.createdAt).getTime(),
      atLabel: formatAdminDate(req.createdAt),
      title: `Upgrade requested: ${req.upgradeName ?? "Upgrade"}`,
      detail: req.status ?? undefined,
      tone: "warning",
    });
  }

  events.sort((a, b) => b.sortAt - a.sortAt);
  return events;
}
