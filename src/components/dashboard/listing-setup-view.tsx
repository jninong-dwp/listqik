"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  type ListingPlatformId,
  normalizeListingPlatforms,
} from "@/lib/listing-platforms";

/** Mirrors `/api/dashboard/listings/[id]` GET payload (+ merged defaults for older rows). */
export type ListingSetupData = {
  id: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  legalLot: string;
  legalBlock: string;
  legalAddition: string;
  legalDescription: string;
  propertyType: string;
  parcelId: string;
  sellerNames: string;
  contactPhone: string;
  contactEmail: string;
  feeSimpleConfirmed: boolean;
  tenantOccupied: boolean;
  namedSubdivision: boolean;
  subdivisionName: string;
  associationType: string;
  newConstruction: boolean;
  septicSystem: boolean;
  hasSolarSystem: boolean;
  hasPool: boolean;
  lockboxOrKeypad: boolean;
  lockboxInstructions: string;
  ownershipType: string;
  allSignersUsCitizens: boolean;
  anyOwnerLicensedAgent: boolean;
  allOwnersOccupyProperty: boolean;
  businessEntityName: string;
  businessEntityRegisteredName: string;
  businessEntitySignerName: string;
  businessEntitySignerTitle: string;
  businessEntitySignerEmail: string;
  allOwnersConsentEsign: boolean;
  appointmentPhone: string;
  appointmentPhoneCanText: boolean;
  alternatePhone: string;
  alternatePhoneCanText: boolean;
  appointmentEmail: string;
  mlsName: string;
  mlsNumber: string;
  listingId: string;
  listingPlatforms: ListingPlatformId[];
  additionalPhotoUrls: string[];
  status: string;
  planLabel: string;
  price: number;
  buyerAgentCompPct: number | null;
  description: string;
  listingStartOn: string | null;
  listingEndOn: string | null;
  flatFee: number | null;
  protectionPeriodDays: number | null;
  intermediaryStatusAuthorized: boolean;
  buyerAgentCompType: string;
  buyerAgentCompAmount: number | null;
  exclusions: string;
  hoaRequired: boolean;
  improvementsAndAccessories: string;
  publicRemarks: string;
  privateRemarks: string;
  drivingDirections: string;
  crossStreet: string;
  schedulingService: string;
  keyboxPermission: boolean;
  keyboxRiskAcknowledged: boolean;
  firstPhotoExteriorConfirmed: boolean;
  photoNoSignsConfirmed: boolean;
  photoNoPeoplePetsConfirmed: boolean;
  photoCopyrightConfirmed: boolean;
  yearBuilt: number | null;
  isInMudWaterDistrict: boolean;
  fairHousingNoticeConfirmed: boolean;
  valuablesNoticeConfirmed: boolean;
  iabsAcknowledged: boolean;
  sellersDisclosureAcknowledged: boolean;
  listingAgreementAcknowledged: boolean;
  brokerBrandingConfirmed: boolean;
  informationAccurateConfirmed: boolean;
  referredByExistingCustomer: boolean;
  wantsListingProcessFeedback: boolean;
  heroImageUrl: string;
  orderedOn: string | null;
  listedOn: string | null;
  expiresOn: string | null;
  setupFinalizedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const LISTING_SETUP_DEFAULTS: ListingSetupData = {
  id: "",
  street: "",
  unit: "",
  city: "",
  state: "",
  zip: "",
  county: "",
  legalLot: "",
  legalBlock: "",
  legalAddition: "",
  legalDescription: "",
  propertyType: "SINGLE_FAMILY",
  parcelId: "",
  sellerNames: "",
  contactPhone: "",
  contactEmail: "",
  feeSimpleConfirmed: false,
  tenantOccupied: false,
  namedSubdivision: false,
  subdivisionName: "",
  associationType: "NONE",
  newConstruction: false,
  septicSystem: false,
  hasSolarSystem: false,
  hasPool: false,
  lockboxOrKeypad: false,
  lockboxInstructions: "",
  ownershipType: "INDIVIDUAL",
  allSignersUsCitizens: true,
  anyOwnerLicensedAgent: false,
  allOwnersOccupyProperty: true,
  businessEntityName: "",
  businessEntityRegisteredName: "",
  businessEntitySignerName: "",
  businessEntitySignerTitle: "",
  businessEntitySignerEmail: "",
  allOwnersConsentEsign: false,
  appointmentPhone: "",
  appointmentPhoneCanText: false,
  alternatePhone: "",
  alternatePhoneCanText: false,
  appointmentEmail: "",
  mlsName: "",
  mlsNumber: "",
  listingId: "",
  listingPlatforms: [],
  additionalPhotoUrls: [],
  status: "INCOMPLETE",
  planLabel: "",
  price: 0,
  buyerAgentCompPct: null,
  description: "",
  listingStartOn: null,
  listingEndOn: null,
  flatFee: null,
  protectionPeriodDays: null,
  intermediaryStatusAuthorized: false,
  buyerAgentCompType: "PERCENT",
  buyerAgentCompAmount: null,
  exclusions: "",
  hoaRequired: false,
  improvementsAndAccessories: "",
  publicRemarks: "",
  privateRemarks: "",
  drivingDirections: "",
  crossStreet: "",
  schedulingService: "",
  keyboxPermission: false,
  keyboxRiskAcknowledged: false,
  firstPhotoExteriorConfirmed: false,
  photoNoSignsConfirmed: false,
  photoNoPeoplePetsConfirmed: false,
  photoCopyrightConfirmed: false,
  yearBuilt: null,
  isInMudWaterDistrict: false,
  fairHousingNoticeConfirmed: false,
  valuablesNoticeConfirmed: false,
  iabsAcknowledged: false,
  sellersDisclosureAcknowledged: false,
  listingAgreementAcknowledged: false,
  brokerBrandingConfirmed: false,
  informationAccurateConfirmed: false,
  referredByExistingCustomer: false,
  wantsListingProcessFeedback: false,
  heroImageUrl: "",
  orderedOn: null,
  listedOn: null,
  expiresOn: null,
  setupFinalizedAt: null,
  createdAt: null,
  updatedAt: null,
};

function mergeListing(raw: Partial<ListingSetupData> & { id: string }): ListingSetupData {
  const additionalPhotoUrls = Array.isArray(raw.additionalPhotoUrls)
    ? raw.additionalPhotoUrls.filter((u) => typeof u === "string" && u.trim().length > 0)
    : [];
  return {
    ...LISTING_SETUP_DEFAULTS,
    ...raw,
    listingPlatforms: normalizeListingPlatforms(raw.listingPlatforms),
    additionalPhotoUrls,
  };
}

const PUBLIC_REMARKS_MAX = 1200;
const COMPLIANCE_FEE_PCT = 0.5;

const previewSetupListings: ListingSetupData[] = [
  mergeListing({
    id: "preview-listing-1",
    street: "1234 Lakeshore Dr",
    city: "Austin",
    state: "TX",
    zip: "78704",
    county: "Travis",
    parcelId: "R123456",
    legalDescription: "SUBDIVISION EXAMPLE BLOCK 1 LOT 2",
    yearBuilt: 1998,
    mlsName: "Austin Board of Realtors",
    mlsNumber: "ABR-1234567",
    listingId: "LISTQIK-1001",
    status: "INCOMPLETE",
    planLabel: "Gold Plan · 25 photos",
    price: 545000,
    buyerAgentCompPct: 2.5,
    publicRemarks:
      "Beautifully updated single-story home with open kitchen, covered patio, and quick access to downtown Austin.",
    description:
      "Beautifully updated single-story home with open kitchen, covered patio, and quick access to downtown Austin.",
    drivingDirections: "From downtown, take Lamar south and turn east on Example Rd.",
    crossStreet: "Example Rd & Barton Blvd",
    sellerNames: "Preview Seller",
    contactPhone: "512-555-0100",
    contactEmail: "seller@example.com",
    appointmentPhone: "512-555-0100",
    appointmentEmail: "seller@example.com",
    feeSimpleConfirmed: true,
    allOwnersConsentEsign: true,
    listingPlatforms: ["MLS", "ZILLOW"],
    orderedOn: "2026-04-12T08:00:00.000Z",
  }),
  mergeListing({
    id: "preview-listing-2",
    street: "8702 Meadow Park Ln",
    city: "Houston",
    state: "TX",
    zip: "77064",
    county: "Harris",
    mlsName: "Houston Association of Realtors",
    mlsNumber: "HAR-8923410",
    listingId: "LISTQIK-1002",
    status: "ACTIVE",
    planLabel: "Platinum Plan · 40 photos",
    price: 429000,
    buyerAgentCompPct: 3,
    publicRemarks: "Move-in ready two-story with upgraded kitchen and large backyard.",
    description: "Move-in ready two-story with upgraded kitchen and large backyard.",
    drivingDirections: "From Beltway 8, exit Example and head north.",
    crossStreet: "Meadow Park & Oak Hollow",
    sellerNames: "Preview Seller Two",
    contactPhone: "713-555-0199",
    contactEmail: "seller2@example.com",
    appointmentPhone: "713-555-0199",
    appointmentEmail: "seller2@example.com",
    parcelId: "P-998877",
    yearBuilt: 2005,
    orderedOn: "2026-03-22T08:00:00.000Z",
    listedOn: "2026-03-30T08:00:00.000Z",
    expiresOn: "2026-09-30T08:00:00.000Z",
    setupFinalizedAt: "2026-03-29T08:00:00.000Z",
    feeSimpleConfirmed: true,
    allOwnersConsentEsign: true,
    intermediaryStatusAuthorized: true,
    listingStartOn: "2026-03-30T08:00:00.000Z",
    listingEndOn: "2026-09-30T08:00:00.000Z",
    fairHousingNoticeConfirmed: true,
    valuablesNoticeConfirmed: true,
    iabsAcknowledged: true,
    sellersDisclosureAcknowledged: true,
    listingAgreementAcknowledged: true,
    brokerBrandingConfirmed: true,
    informationAccurateConfirmed: true,
    firstPhotoExteriorConfirmed: true,
    photoNoSignsConfirmed: true,
    photoNoPeoplePetsConfirmed: true,
    photoCopyrightConfirmed: true,
    listingPlatforms: ["MLS", "REALTOR_COM"],
  }),
  mergeListing({
    id: "preview-listing-3",
    street: "4517 Mesa Ridge Ct",
    unit: "Unit B",
    city: "San Antonio",
    state: "TX",
    zip: "78230",
    county: "Bexar",
    mlsName: "San Antonio Board of Realtors",
    mlsNumber: "SABOR-5512098",
    listingId: "LISTQIK-1003",
    status: "PENDING",
    planLabel: "Silver Plan · 15 photos",
    price: 318000,
    buyerAgentCompPct: 2.75,
    publicRemarks: "Updated condo with modern finishes and private patio.",
    description: "Updated condo with modern finishes and private patio.",
    drivingDirections: "Take I-10 to Example Rd, north on Mesa Ridge.",
    crossStreet: "Mesa Ridge & Bitters",
    sellerNames: "Preview Seller Three",
    contactPhone: "210-555-0177",
    contactEmail: "seller3@example.com",
    appointmentPhone: "210-555-0177",
    appointmentEmail: "seller3@example.com",
    parcelId: "BEX-445566",
    yearBuilt: 2012,
    propertyType: "CONDOMINIUM",
    associationType: "CONDO",
    orderedOn: "2026-02-10T08:00:00.000Z",
    listedOn: "2026-02-20T08:00:00.000Z",
    expiresOn: "2026-08-20T08:00:00.000Z",
    setupFinalizedAt: "2026-02-19T08:00:00.000Z",
    feeSimpleConfirmed: true,
    allOwnersConsentEsign: true,
    listingPlatforms: ["OTHER_PLATFORMS"],
  }),
];

type SetupStep = {
  id: string;
  title: string;
  subtitle: string;
  complete: boolean;
};

function formatDate(value: string | null) {
  if (!value) return "Pending";
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return "Pending";
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function readYesNo(group: string, fallback: boolean): boolean {
  const sel = document.querySelector(`input[name="${group}"]:checked`) as HTMLInputElement | null;
  if (!sel) return fallback;
  return sel.value === "yes";
}

function readOptionalDate(inputId: string): string | null {
  const raw = (document.getElementById(inputId) as HTMLInputElement | null)?.value ?? "";
  if (!raw) return null;
  const d = new Date(`${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function legalComplete(l: ListingSetupData): boolean {
  const structured =
    Boolean(l.legalLot?.trim()) && Boolean(l.legalBlock?.trim()) && Boolean(l.legalAddition?.trim());
  const desc = Boolean(l.legalDescription?.trim());
  return structured || desc;
}

function propertyDescComplete(l: ListingSetupData): boolean {
  const primary = Math.max(l.publicRemarks.trim().length, l.description.trim().length);
  return primary >= 40;
}

function photosComplete(l: ListingSetupData): boolean {
  return Boolean(l.heroImageUrl?.trim()) &&
    l.firstPhotoExteriorConfirmed &&
    l.photoNoSignsConfirmed &&
    l.photoNoPeoplePetsConfirmed &&
    l.photoCopyrightConfirmed;
}

function generalComplete(l: ListingSetupData): boolean {
  const addr = Boolean(l.street?.trim() && l.city?.trim() && l.state?.trim() && l.zip?.trim());
  const yb = typeof l.yearBuilt === "number" && l.yearBuilt >= 1600 && l.yearBuilt <= 2100;
  return addr && yb && legalComplete(l);
}

function contactComplete(l: ListingSetupData): boolean {
  const base =
    Boolean(l.county?.trim()) &&
    Boolean(l.sellerNames?.trim()) &&
    Boolean(l.contactPhone?.trim()) &&
    Boolean(l.contactEmail?.trim()) &&
    Boolean(l.appointmentPhone?.trim()) &&
    Boolean(l.appointmentEmail?.trim()) &&
    l.feeSimpleConfirmed &&
    l.allOwnersConsentEsign;

  if (l.ownershipType === "BUSINESS_ENTITY") {
    return (
      base &&
      Boolean(l.businessEntityName?.trim()) &&
      Boolean(l.businessEntityRegisteredName?.trim()) &&
      Boolean(l.businessEntitySignerName?.trim()) &&
      Boolean(l.businessEntitySignerTitle?.trim()) &&
      Boolean(l.businessEntitySignerEmail?.trim())
    );
  }
  return base;
}

function disclosuresComplete(l: ListingSetupData): boolean {
  return (
    l.fairHousingNoticeConfirmed &&
    l.valuablesNoticeConfirmed &&
    l.iabsAcknowledged &&
    l.sellersDisclosureAcknowledged &&
    l.brokerBrandingConfirmed &&
    l.informationAccurateConfirmed &&
    l.intermediaryStatusAuthorized &&
    Boolean(l.listingStartOn)
  );
}

export function ListingSetupView({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<ListingSetupData | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizeDetails, setFinalizeDetails] = useState<string[]>([]);
  const [showPhotoDisclaimer, setShowPhotoDisclaimer] = useState(false);
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);
  const [photoDisclaimerAccepted, setPhotoDisclaimerAccepted] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);
  const [heroUploadBusy, setHeroUploadBusy] = useState(false);
  const [galleryUploadBusy, setGalleryUploadBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFinalizeError(null);
    setFinalizeDetails([]);

    const previewListing = previewSetupListings.find((item) => item.id === listingId);
    if (previewListing) {
      setListing(previewListing);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/dashboard/listings/${listingId}`, { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; listing?: Partial<ListingSetupData> & { id: string }; error?: string }
          | null;
        if (!res.ok || !data?.ok || !data.listing) {
          if (res.status === 401) throw new Error("Please sign in to load this listing setup.");
          throw new Error(data?.error || "Could not load listing setup.");
        }
        if (!cancelled) setListing(mergeListing(data.listing as Partial<ListingSetupData> & { id: string }));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setListing(null);
        setError(err instanceof Error ? err.message : "Could not load listing setup.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const steps = useMemo<SetupStep[]>(() => {
    if (!listing) return [];
    return [
      {
        id: "general-information",
        title: "General information",
        subtitle: "Address & property details (parcel, legal, association)",
        complete: generalComplete(listing),
      },
      {
        id: "contact-ownership",
        title: "Contact / ownership",
        subtitle: "Owners, signing authority, appointment contacts",
        complete: contactComplete(listing),
      },
      {
        id: "price-compensation",
        title: "Price & compensation",
        subtitle: "List price & buyer-agent compensation",
        complete: listing.price > 0 && listing.buyerAgentCompPct !== null,
      },
      {
        id: "property-description",
        title: "Property description",
        subtitle: "MLS public remarks",
        complete: propertyDescComplete(listing),
      },
      {
        id: "photos-media",
        title: "Photos",
        subtitle: "Hero image & MLS photo confirmations",
        complete: photosComplete(listing),
      },
      {
        id: "complete-listing-setup",
        title: "Review & finalize",
        subtitle: "Disclosures, dates, accuracy — publish readiness",
        complete: listing.status !== "INCOMPLETE" && disclosuresComplete(listing),
      },
    ];
  }, [listing]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = window.localStorage.getItem("listing-photo-disclaimer-accepted") === "true";
    setPhotoDisclaimerAccepted(accepted);
  }, []);

  function handleStepNavClick(stepId: string, event: React.MouseEvent<HTMLAnchorElement>) {
    if (stepId !== "photos-media" || photoDisclaimerAccepted) return;
    event.preventDefault();
    setPendingAnchor(stepId);
    setShowPhotoDisclaimer(true);
  }

  function acceptPhotoDisclaimer() {
    setShowPhotoDisclaimer(false);
    setPhotoDisclaimerAccepted(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("listing-photo-disclaimer-accepted", "true");
    }
    if (pendingAnchor) {
      document.getElementById(pendingAnchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingAnchor(null);
    }
  }

  const completionCount = steps.filter((s) => s.complete).length;
  const completionPct = steps.length ? Math.round((completionCount / steps.length) * 100) : 0;
  const currentStepIndex = steps.findIndex((step) => !step.complete);
  const activeStepIndex = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;
  const canFinalize = Boolean(
    listing &&
      steps.find((s) => s.id === "general-information")?.complete &&
      steps.find((s) => s.id === "contact-ownership")?.complete &&
      steps.find((s) => s.id === "price-compensation")?.complete &&
      steps.find((s) => s.id === "property-description")?.complete &&
      steps.find((s) => s.id === "photos-media")?.complete &&
      disclosuresComplete(listing),
  );
  const prevStep = activeStepIndex > 0 ? steps[activeStepIndex - 1] : null;
  const nextStep = activeStepIndex < steps.length - 1 ? steps[activeStepIndex + 1] : null;

  const missingByStep = useMemo((): Record<string, string[]> => {
    if (!listing) return {};
    const g: string[] = [];
    if (!listing.street?.trim()) g.push("Street");
    if (!listing.city?.trim()) g.push("City");
    if (!listing.state?.trim()) g.push("State");
    if (!listing.zip?.trim()) g.push("ZIP");
    if (!(typeof listing.yearBuilt === "number" && listing.yearBuilt >= 1600))
      g.push("Year built (4-digit)");
    if (!legalComplete(listing)) g.push("Legal description or lot/block/addition");

    const c: string[] = [];
    if (!listing.county?.trim()) c.push("County");
    if (!listing.sellerNames?.trim()) c.push("Seller legal name(s)");
    if (!listing.contactPhone?.trim()) c.push("Primary phone");
    if (!listing.contactEmail?.trim()) c.push("Primary email");
    if (!listing.appointmentPhone?.trim()) c.push("Appointment phone");
    if (!listing.appointmentEmail?.trim()) c.push("Appointment email");
    if (!listing.feeSimpleConfirmed) c.push("Fee simple confirmation");
    if (!listing.allOwnersConsentEsign) c.push("E-sign consent");
    if (listing.ownershipType === "BUSINESS_ENTITY") {
      if (!listing.businessEntityName?.trim()) c.push("Business entity name");
      if (!listing.businessEntityRegisteredName?.trim()) c.push("Registered legal name");
      if (!listing.businessEntitySignerName?.trim()) c.push("Signer name");
      if (!listing.businessEntitySignerTitle?.trim()) c.push("Signer title");
      if (!listing.businessEntitySignerEmail?.trim()) c.push("Signer email");
    }

    const d: string[] = [];
    if (Math.max(listing.publicRemarks.trim().length, listing.description.trim().length) < 40)
      d.push("MLS description (40+ chars)");

    const photos: string[] = [];
    if (!listing.heroImageUrl?.trim()) photos.push("Hero image URL");
    if (!listing.firstPhotoExteriorConfirmed) photos.push("Exterior-first photo confirmation");
    if (!listing.photoNoSignsConfirmed) photos.push("No signs confirmation");
    if (!listing.photoNoPeoplePetsConfirmed) photos.push("No people/pets confirmation");
    if (!listing.photoCopyrightConfirmed) photos.push("Photo rights confirmation");

    const fin: string[] = [];
    if (!listing.intermediaryStatusAuthorized) fin.push("Intermediary authorization");
    if (!listing.listingStartOn) fin.push("Listing start date");
    if (!listing.fairHousingNoticeConfirmed) fin.push("Fair housing notice");
    if (!listing.valuablesNoticeConfirmed) fin.push("Valuables notice");
    if (!listing.iabsAcknowledged) fin.push("IABS");
    if (!listing.sellersDisclosureAcknowledged) fin.push("Seller disclosure acknowledgment");
    if (!listing.brokerBrandingConfirmed) fin.push("Broker branding acknowledgment");
    if (!listing.informationAccurateConfirmed) fin.push("Accuracy verification");

    return {
      "general-information": g,
      "contact-ownership": c,
      "price-compensation": [
        ...(listing.price <= 0 ? ["Valid list price"] : []),
        ...(listing.buyerAgentCompPct === null ? ["Buyer-agent compensation %"] : []),
      ],
      "property-description": d,
      "photos-media": photos,
      "complete-listing-setup": fin,
    };
  }, [listing]);

  async function finalizeSetup() {
    if (listingId.startsWith("preview-")) {
      setFinalizeError("Finalize is disabled in preview mode.");
      return;
    }
    setFinalizing(true);
    setFinalizeError(null);
    setFinalizeDetails([]);
    setFinalizeSuccess(false);
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/finalize`, { method: "POST" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; validationErrors?: string[] }
        | null;
      if (!res.ok || !data?.ok) {
        setFinalizeError(data?.error ?? "Could not finalize listing setup.");
        setFinalizeDetails(data?.validationErrors ?? []);
        return;
      }
      setFinalizeSuccess(true);
      const refreshed = await fetch(`/api/dashboard/listings/${listingId}`, { cache: "no-store" });
      const refreshedData = (await refreshed.json().catch(() => null)) as {
        ok?: boolean;
        listing?: Partial<ListingSetupData> & { id: string };
      } | null;
      if (refreshed.ok && refreshedData?.ok && refreshedData.listing) {
        setListing(mergeListing(refreshedData.listing));
      }
    } catch {
      setFinalizeError("Network error while finalizing setup.");
    } finally {
      setFinalizing(false);
    }
  }

  function draftValue(key: keyof ListingSetupData): string {
    if (!listing) return "";
    const value = listing[key];
    if (value === null || value === undefined) return "";
    return String(value);
  }

  function dateInputValue(iso: string | null): string {
    if (!iso) return "";
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }

  async function savePatch(sectionId: string, body: Record<string, unknown>) {
    if (listingId.startsWith("preview-")) {
      setFinalizeError("Saving is disabled in preview mode.");
      return;
    }
    setSavingSection(sectionId);
    setFinalizeError(null);
    setFinalizeDetails([]);
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setFinalizeError(data?.error ?? "Could not save section.");
        return;
      }
      const refreshed = await fetch(`/api/dashboard/listings/${listingId}`, { cache: "no-store" });
      const refreshedData = (await refreshed.json().catch(() => null)) as {
        ok?: boolean;
        listing?: Partial<ListingSetupData> & { id: string };
      } | null;
      if (refreshed.ok && refreshedData?.ok && refreshedData.listing) {
        setListing(mergeListing(refreshedData.listing));
      }
    } catch {
      setFinalizeError("Network error while saving section.");
    } finally {
      setSavingSection(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-emerald-500/25 bg-black/45 p-8 text-sm text-white/75">
        Loading listing setup...
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="rounded-2xl border border-rose-400/40 bg-rose-950/35 p-6 text-sm text-rose-100">
        {error || "Unable to load listing setup."}
      </div>
    );
  }

  const activeListing = listing;

  async function uploadHeroFile(file: File) {
    if (listingId.startsWith("preview-")) {
      setFinalizeError("Upload is disabled in preview mode.");
      return;
    }
    setHeroUploadBusy(true);
    setFinalizeError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`/api/dashboard/listings/${listingId}/hero-image/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = (await uploadRes.json().catch(() => null)) as
        | { ok?: boolean; publicUrl?: string; error?: string }
        | null;
      if (!uploadRes.ok || !uploadData?.ok || !uploadData.publicUrl) {
        setFinalizeError(uploadData?.error ?? "Image upload failed.");
        return;
      }
      await savePatch("photos-media", { heroImageUrl: uploadData.publicUrl });
    } catch {
      setFinalizeError("Network error while uploading image.");
    } finally {
      setHeroUploadBusy(false);
    }
  }

  async function uploadGalleryFile(file: File) {
    if (listingId.startsWith("preview-")) {
      setFinalizeError("Upload is disabled in preview mode.");
      return;
    }
    setGalleryUploadBusy(true);
    setFinalizeError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`/api/dashboard/listings/${listingId}/gallery/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = (await uploadRes.json().catch(() => null)) as
        | { ok?: boolean; publicUrl?: string; error?: string }
        | null;
      if (!uploadRes.ok || !uploadData?.ok || !uploadData.publicUrl) {
        setFinalizeError(uploadData?.error ?? "Image upload failed.");
        return;
      }
      const current = activeListing.additionalPhotoUrls ?? [];
      await savePatch("photos-media", {
        additionalPhotoUrls: [...current, uploadData.publicUrl].slice(0, 40),
      });
    } catch {
      setFinalizeError("Network error while uploading image.");
    } finally {
      setGalleryUploadBusy(false);
    }
  }

  function removeGalleryUrl(url: string) {
    const current = activeListing.additionalPhotoUrls ?? [];
    void savePatch("photos-media", { additionalPhotoUrls: current.filter((u) => u !== url) });
  }

  const priceForMath = activeListing.price > 0 ? activeListing.price : 0;
  const bacPctResolved =
    activeListing.buyerAgentCompPct !== null && activeListing.buyerAgentCompPct !== undefined
      ? activeListing.buyerAgentCompPct
      : null;
  const bacPct = bacPctResolved ?? 0;
  const complianceFeeAmt = (priceForMath * COMPLIANCE_FEE_PCT) / 100;
  const buyerFeeAmt = (priceForMath * bacPct) / 100;
  const totalFeePct = bacPct + COMPLIANCE_FEE_PCT;
  const totalFeeAmt = buyerFeeAmt + complianceFeeAmt;

  const formKey = listing.updatedAt ?? listing.id;

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-emerald-500/25 bg-black/55 p-4">
        <div className="rounded-xl border border-emerald-400/35 bg-emerald-950/35 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/80">Setup progress</p>
          <p className="mt-1 text-lg font-semibold text-emerald-100">{completionPct}% complete</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
        <p className="mt-3 text-xs text-white/60">
          {listing.street}, {listing.city}, {listing.state} {listing.zip}
          {listing.county ? ` · County: ${listing.county}` : ""}
        </p>
        <ol className="mt-4 space-y-2">
          {steps.map((step, index) => (
            <li key={step.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
                    step.complete
                      ? "border-emerald-300/60 bg-emerald-500/25 text-emerald-100"
                      : "border-white/20 bg-black/35 text-white/55",
                  ].join(" ")}
                >
                  {step.complete ? "✓" : index + 1}
                </span>
                <a
                  href={`#${step.id}`}
                  onClick={(event) => handleStepNavClick(step.id, event)}
                  className="text-sm font-semibold text-emerald-100 hover:underline"
                >
                  {step.title}
                </a>
              </div>
              <p className="mt-1 text-xs text-white/65">{step.subtitle}</p>
            </li>
          ))}
        </ol>
      </aside>

      <section className="rounded-2xl border border-emerald-500/25 bg-black/45 p-5 sm:p-6">
        <header className="border-b border-emerald-500/25 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">MLS listing setup</p>
          <h1 className="mt-2 text-2xl font-semibold text-emerald-50">Listing setup wizard</h1>
          <p className="mt-2 text-sm text-white/70">
            Property facts, contacts, pricing, public remarks, where you want to market the home, photos, then
            disclosures before you finalize.
          </p>
        </header>
        {finalizeSuccess ? (
          <div className="mt-4 rounded-xl border border-emerald-400/45 bg-emerald-950/40 p-4 text-sm text-emerald-100">
            Your listing has been successfully submitted. We will review and activate your property within 24 hours.
          </div>
        ) : null}
        {finalizeError ? (
          <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-950/35 p-4 text-sm text-rose-100">
            <p>{finalizeError}</p>
            {finalizeDetails.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-rose-100/90">
                {finalizeDetails.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div key={formKey} className="mt-5 grid gap-5">
          <InfoCard
            id="general-information"
            title="Step 1 — General information"
            complete={steps.find((s) => s.id === "general-information")?.complete ?? false}
            missingItems={missingByStep["general-information"] ?? []}
          >
            <Subheading>Property address</Subheading>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Street address *" id="street" defaultValue={draftValue("street")} />
              <Field label="Unit #" id="unit" defaultValue={draftValue("unit")} />
              <Field label="City *" id="city" defaultValue={draftValue("city")} />
              <Field label="State *" id="state" defaultValue={draftValue("state")} />
              <Field label="ZIP *" id="zip" defaultValue={draftValue("zip")} />
              <Field label="County *" id="county-general" defaultValue={draftValue("county")} />
            </div>

            <Subheading className="mt-6">Property details</Subheading>
            <Hint>Parcel ID and legal description are typically on your tax bill or county appraiser site.</Hint>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Parcel ID (optional)" id="parcelId" defaultValue={draftValue("parcelId")} />
              <SelectField
                label="Property type *"
                id="propertyType"
                defaultValue={listing.propertyType}
                options={[
                  { value: "SINGLE_FAMILY", label: "Single-family" },
                  { value: "CONDOMINIUM", label: "Condominium" },
                ]}
              />
            </div>
            <label className="mt-3 block" htmlFor="legalDescription">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
                Property legal description *
              </span>
              <textarea
                id="legalDescription"
                rows={3}
                defaultValue={draftValue("legalDescription")}
                placeholder="e.g. SUBDIVISION NAME BLOCK 2 LOT 4"
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-emerald-100 outline-none ring-emerald-300/40 focus:ring"
              />
            </label>
            <p className="mt-2 text-xs text-white/55">
              Or enter lot / block / addition separately (required if legal description is blank):
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <Field label="Legal lot" id="legalLot" defaultValue={draftValue("legalLot")} />
              <Field label="Legal block" id="legalBlock" defaultValue={draftValue("legalBlock")} />
              <Field label="Legal addition" id="legalAddition" defaultValue={draftValue("legalAddition")} />
            </div>

            <div className="mt-4 space-y-3">
              <FieldLabel>Named subdivision, condo complex or development? *</FieldLabel>
              <RadioYesNo name="namedSubdivision" defaultYes={listing.namedSubdivision} />
              <Hint>Choose Yes if your neighborhood or condo building has an official name.</Hint>
              <Field label="Subdivision / complex name (if Yes)" id="subdivisionName" defaultValue={draftValue("subdivisionName")} />
            </div>

            <div className="mt-4 space-y-2">
              <FieldLabel>Property governed by an association? *</FieldLabel>
              <AssociationRadios defaultValue={listing.associationType} />
              <Hint>HOA vs condo association differs by who owns land vs unit airspace.</Hint>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>New construction (never occupied)? *</FieldLabel>
                <RadioYesNo name="newConstruction" defaultYes={listing.newConstruction} />
              </div>
              <Field label="Year built *" id="yearBuilt" defaultValue={draftValue("yearBuilt")} type="number" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Septic system (vs city sewer)? *</FieldLabel>
                <RadioYesNo name="septicSystem" defaultYes={listing.septicSystem} />
              </div>
              <div>
                <FieldLabel>Solar panels installed (owned or leased)? *</FieldLabel>
                <RadioYesNo name="hasSolarSystem" defaultYes={listing.hasSolarSystem} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Pool on property?</FieldLabel>
                <RadioYesNo name="hasPool" defaultYes={listing.hasPool} />
              </div>
              <div>
                <FieldLabel>Lockbox or keypad for access?</FieldLabel>
                <RadioYesNo name="lockboxOrKeypad" defaultYes={listing.lockboxOrKeypad} />
              </div>
            </div>
            <Field
              label="Lockbox / keypad instructions or combination (optional)"
              id="lockboxInstructions"
              defaultValue={draftValue("lockboxInstructions")}
            />
            <Hint>If you use a lockbox or keypad, add combo or vendor instructions when you have them.</Hint>

            <SaveBar
              busy={savingSection === "general-information"}
              onSave={() => {
                void savePatch("general-information", {
                  street: (document.getElementById("street") as HTMLInputElement)?.value ?? "",
                  unit: (document.getElementById("unit") as HTMLInputElement)?.value ?? "",
                  city: (document.getElementById("city") as HTMLInputElement)?.value ?? "",
                  state: (document.getElementById("state") as HTMLInputElement)?.value ?? "",
                  zip: (document.getElementById("zip") as HTMLInputElement)?.value ?? "",
                  county: (document.getElementById("county-general") as HTMLInputElement)?.value ?? "",
                  parcelId: (document.getElementById("parcelId") as HTMLInputElement)?.value ?? "",
                  legalDescription: (document.getElementById("legalDescription") as HTMLTextAreaElement)?.value ?? "",
                  legalLot: (document.getElementById("legalLot") as HTMLInputElement)?.value ?? "",
                  legalBlock: (document.getElementById("legalBlock") as HTMLInputElement)?.value ?? "",
                  legalAddition: (document.getElementById("legalAddition") as HTMLInputElement)?.value ?? "",
                  propertyType: (document.getElementById("propertyType") as HTMLSelectElement)?.value,
                  namedSubdivision: readYesNo("namedSubdivision", listing.namedSubdivision),
                  subdivisionName: (document.getElementById("subdivisionName") as HTMLInputElement)?.value ?? "",
                  associationType: (
                    document.querySelector('input[name="associationType"]:checked') as HTMLInputElement | null
                  )?.value ?? "NONE",
                  newConstruction: readYesNo("newConstruction", listing.newConstruction),
                  septicSystem: readYesNo("septicSystem", listing.septicSystem),
                  hasSolarSystem: readYesNo("hasSolarSystem", listing.hasSolarSystem),
                  hasPool: readYesNo("hasPool", listing.hasPool),
                  lockboxOrKeypad: readYesNo("lockboxOrKeypad", listing.lockboxOrKeypad),
                  lockboxInstructions: (document.getElementById("lockboxInstructions") as HTMLInputElement)?.value ?? "",
                  yearBuilt: (() => {
                    const raw = (document.getElementById("yearBuilt") as HTMLInputElement)?.value ?? "";
                    const n = Number(raw);
                    return raw === "" ? null : n;
                  })(),
                });
              }}
            />
          </InfoCard>

          <InfoCard
            id="contact-ownership"
            title="Step 2 — Contact / ownership"
            complete={steps.find((s) => s.id === "contact-ownership")?.complete ?? false}
            missingItems={missingByStep["contact-ownership"] ?? []}
          >
            <SelectField
              label="Property ownership / signing authority *"
              id="ownershipType"
              defaultValue={listing.ownershipType}
              options={[
                { value: "INDIVIDUAL", label: "Owned by individual(s)" },
                { value: "MARRIED_COUPLE", label: "Married couple / joint owners" },
                { value: "DECEASED_ESTATE", label: "Estate / trustee signing" },
                { value: "BUSINESS_ENTITY", label: "Corporation or business entity" },
                { value: "POWER_OF_ATTORNEY", label: "Power of attorney for owner(s)" },
              ]}
            />
            <div className="mt-4 space-y-2">
              <FieldLabel>Are all document signers U.S. citizens?</FieldLabel>
              <RadioYesNo name="allSignersUsCitizens" defaultYes={listing.allSignersUsCitizens} />
            </div>
            <div className="mt-4 space-y-2">
              <FieldLabel>Are any owners a licensed real estate agent or broker?</FieldLabel>
              <RadioYesNo name="anyOwnerLicensedAgent" defaultYes={listing.anyOwnerLicensedAgent} />
            </div>

            <Subheading className="mt-6">Seller / owner contact</Subheading>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Seller legal name(s) *" id="sellerNames" defaultValue={draftValue("sellerNames")} />
              <Field label="Primary phone *" id="contactPhone" defaultValue={draftValue("contactPhone")} type="tel" />
              <Field label="Primary email *" id="contactEmail" defaultValue={draftValue("contactEmail")} type="email" />
            </div>

            <Subheading className="mt-6">Business entity (if applicable)</Subheading>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Business entity name" id="businessEntityName" defaultValue={draftValue("businessEntityName")} />
              <Field
                label="Registered legal name"
                id="businessEntityRegisteredName"
                defaultValue={draftValue("businessEntityRegisteredName")}
              />
              <Field
                label="Signer name (first & last)"
                id="businessEntitySignerName"
                defaultValue={draftValue("businessEntitySignerName")}
              />
              <Field label="Signer title" id="businessEntitySignerTitle" defaultValue={draftValue("businessEntitySignerTitle")} />
              <Field
                label="Signer email"
                id="businessEntitySignerEmail"
                defaultValue={draftValue("businessEntitySignerEmail")}
                type="email"
              />
            </div>

            <Subheading className="mt-6">Appointment contact (showings)</Subheading>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Appointment phone *" id="appointmentPhone" defaultValue={draftValue("appointmentPhone")} type="tel" />
              <div className="space-y-1">
                <FieldLabel className="mb-1">Appointment phone can receive texts?</FieldLabel>
                <RadioYesNo name="appointmentPhoneCanText" defaultYes={listing.appointmentPhoneCanText} />
              </div>
              <Field label="Alternate phone" id="alternatePhone" defaultValue={draftValue("alternatePhone")} type="tel" />
              <div className="space-y-1">
                <FieldLabel className="mb-1">Alternate phone can receive texts?</FieldLabel>
                <RadioYesNo name="alternatePhoneCanText" defaultYes={listing.alternatePhoneCanText} />
              </div>
              <Field
                label="Appointment email *"
                id="appointmentEmail"
                defaultValue={draftValue("appointmentEmail")}
                type="email"
              />
            </div>

            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <CheckboxRow
                id="feeSimpleConfirmed"
                label="I confirm fee-simple title / authority to list *"
                defaultChecked={listing.feeSimpleConfirmed}
              />
              <CheckboxRow
                id="tenantOccupied"
                label="Property is tenant-occupied (additional docs may be required)"
                defaultChecked={listing.tenantOccupied}
              />
              <CheckboxRow
                id="allOwnersConsentEsign"
                label="All owners consent to electronic signatures *"
                defaultChecked={listing.allOwnersConsentEsign}
              />
              <CheckboxRow
                id="allOwnersOccupyProperty"
                label="All owners occupy the property"
                defaultChecked={listing.allOwnersOccupyProperty}
              />
            </div>

            <SaveBar
              busy={savingSection === "contact-ownership"}
              onSave={() => {
                void savePatch("contact-ownership", {
                  ownershipType: (document.getElementById("ownershipType") as HTMLSelectElement)?.value,
                  allSignersUsCitizens: readYesNo("allSignersUsCitizens", listing.allSignersUsCitizens),
                  anyOwnerLicensedAgent: readYesNo("anyOwnerLicensedAgent", listing.anyOwnerLicensedAgent),
                  sellerNames: (document.getElementById("sellerNames") as HTMLInputElement)?.value ?? "",
                  contactPhone: (document.getElementById("contactPhone") as HTMLInputElement)?.value ?? "",
                  contactEmail: (document.getElementById("contactEmail") as HTMLInputElement)?.value ?? "",
                  businessEntityName: (document.getElementById("businessEntityName") as HTMLInputElement)?.value ?? "",
                  businessEntityRegisteredName:
                    (document.getElementById("businessEntityRegisteredName") as HTMLInputElement)?.value ?? "",
                  businessEntitySignerName:
                    (document.getElementById("businessEntitySignerName") as HTMLInputElement)?.value ?? "",
                  businessEntitySignerTitle:
                    (document.getElementById("businessEntitySignerTitle") as HTMLInputElement)?.value ?? "",
                  businessEntitySignerEmail:
                    (document.getElementById("businessEntitySignerEmail") as HTMLInputElement)?.value ?? "",
                  appointmentPhone: (document.getElementById("appointmentPhone") as HTMLInputElement)?.value ?? "",
                  appointmentPhoneCanText: readYesNo("appointmentPhoneCanText", listing.appointmentPhoneCanText),
                  alternatePhone: (document.getElementById("alternatePhone") as HTMLInputElement)?.value ?? "",
                  alternatePhoneCanText: readYesNo("alternatePhoneCanText", listing.alternatePhoneCanText),
                  appointmentEmail: (document.getElementById("appointmentEmail") as HTMLInputElement)?.value ?? "",
                  feeSimpleConfirmed: (document.getElementById("feeSimpleConfirmed") as HTMLInputElement)?.checked ?? false,
                  tenantOccupied: (document.getElementById("tenantOccupied") as HTMLInputElement)?.checked ?? false,
                  allOwnersConsentEsign:
                    (document.getElementById("allOwnersConsentEsign") as HTMLInputElement)?.checked ?? false,
                  allOwnersOccupyProperty:
                    (document.getElementById("allOwnersOccupyProperty") as HTMLInputElement)?.checked ?? false,
                  county: (document.getElementById("county-general") as HTMLInputElement)?.value ?? listing.county,
                });
              }}
            />
          </InfoCard>

          <InfoCard
            id="price-compensation"
            title="Step 3 — Price & compensation"
            complete={steps.find((s) => s.id === "price-compensation")?.complete ?? false}
            missingItems={missingByStep["price-compensation"] ?? []}
          >
            <Hint>
              Enter the full list price including zeros (e.g. 350000). Buyer-agent compensation is required and must be
              saved before you finalize; MLS compliance fees may apply.
            </Hint>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Listing price *" id="price" defaultValue={draftValue("price")} type="number" />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="bac-pct">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  Compensation to buyer&apos;s agent (%) *
                </span>
                <input
                  id="bac-pct"
                  type="number"
                  min={0}
                  max={6}
                  step={0.25}
                  defaultValue={
                    listing.buyerAgentCompPct === null || listing.buyerAgentCompPct === undefined
                      ? ""
                      : String(listing.buyerAgentCompPct)
                  }
                  placeholder="e.g. 2.5"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-emerald-100 outline-none ring-emerald-300/40 transition focus:ring"
                />
              </label>
              {bacPctResolved !== null ? (
                <p className="mt-2 text-sm font-semibold text-emerald-200">
                  Saved buyer-agent offer: {bacPctResolved}%
                </p>
              ) : (
                <p className="mt-2 text-sm text-white/55">Enter and save a percentage — nothing is assumed.</p>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-950/25 p-4 text-sm text-white/85">
              <p className="font-semibold text-emerald-100">Estimated compensation snapshot</p>
              {bacPctResolved !== null ? (
                <ul className="mt-2 space-y-1 text-xs">
                  <li>
                    Buyer-agent ({bacPct.toFixed(2)}%): {formatMoney(buyerFeeAmt)}
                  </li>
                  <li>
                    Plus compliance fee ({COMPLIANCE_FEE_PCT}%): {formatMoney(complianceFeeAmt)}
                  </li>
                  <li className="font-semibold text-emerald-100">
                    Total {totalFeePct.toFixed(2)}% ≈ {formatMoney(totalFeeAmt)}
                  </li>
                </ul>
              ) : (
                <p className="mt-2 text-xs text-white/55">
                  Save a buyer-agent compensation percentage to see dollar estimates.
                </p>
              )}
              <p className="mt-2 text-[11px] text-white/55">
                Displays using your saved list price; final MLS charges may differ.
              </p>
            </div>
            <SaveBar
              busy={savingSection === "price-compensation"}
              onSave={() => {
                const priceRaw = (document.getElementById("price") as HTMLInputElement)?.value ?? "";
                const pctRaw = (document.getElementById("bac-pct") as HTMLInputElement)?.value ?? "";
                void savePatch("price-compensation", {
                  price: Number(priceRaw),
                  buyerAgentCompPct: pctRaw === "" ? null : Number(pctRaw),
                  buyerAgentCompType: "PERCENT",
                });
              }}
            />
          </InfoCard>

          <InfoCard
            id="property-description"
            title="Step 4 — Property description"
            complete={steps.find((s) => s.id === "property-description")?.complete ?? false}
            missingItems={missingByStep["property-description"] ?? []}
          >
            <div className="rounded-xl border border-cyan-400/25 bg-cyan-950/15 p-4 text-xs text-cyan-50/95">
              <p className="font-semibold text-cyan-100">MLS description rules</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>No links, phone numbers, or email addresses.</li>
                <li>No price or commission language in public remarks.</li>
                <li>No showing instructions (codes, vacancy, lockbox) in public remarks.</li>
                <li>Stay compliant with fair housing laws.</li>
              </ul>
            </div>
            <CharCountArea
              key={`pr-${formKey}`}
              id="publicRemarks"
              label={`MLS / public description * (max ${PUBLIC_REMARKS_MAX} characters)`}
              maxLength={PUBLIC_REMARKS_MAX}
              defaultValue={listing.publicRemarks || listing.description}
              hint="Describe amenities, updates, and lifestyle benefits buyers care about."
            />
            <div className="mt-4 rounded-xl border border-cyan-400/20 bg-black/25 p-3 text-xs text-white/75">
              <p className="font-semibold text-cyan-100/95">Directions tip</p>
              <p className="mt-1">
                Use GPS-friendly guidance when you can (major roads, exits, landmarks). Street-by-street detail is
                helpful but optional at this stage.
              </p>
            </div>
            <label className="mt-4 block" htmlFor="drivingDirections">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
                Basic driving directions (optional)
              </span>
              <textarea
                id="drivingDirections"
                rows={3}
                defaultValue={draftValue("drivingDirections")}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-emerald-100 outline-none ring-emerald-300/40 focus:ring"
              />
            </label>
            <Field
              label="Cross street / nearest corner (optional)"
              id="crossStreet"
              defaultValue={draftValue("crossStreet")}
            />
            <label className="mt-4 block" htmlFor="privateRemarks">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
                Private broker-only remarks (optional)
              </span>
              <textarea
                id="privateRemarks"
                rows={2}
                defaultValue={draftValue("privateRemarks")}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-emerald-100 outline-none ring-emerald-300/40 focus:ring"
              />
            </label>
            <SaveBar
              busy={savingSection === "property-description"}
              onSave={() => {
                const pr = (document.getElementById("publicRemarks") as HTMLTextAreaElement)?.value ?? "";
                void savePatch("property-description", {
                  publicRemarks: pr,
                  description: pr,
                  drivingDirections: (document.getElementById("drivingDirections") as HTMLTextAreaElement)?.value ?? "",
                  crossStreet: (document.getElementById("crossStreet") as HTMLInputElement)?.value ?? "",
                  privateRemarks: (document.getElementById("privateRemarks") as HTMLTextAreaElement)?.value ?? "",
                });
              }}
            />
          </InfoCard>

          <InfoCard
            id="photos-media"
            title="Step 5 — Photos"
            complete={steps.find((s) => s.id === "photos-media")?.complete ?? false}
            missingItems={missingByStep["photos-media"] ?? []}
          >
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-950/20 p-4 text-xs text-white/85">
              <p className="font-semibold text-emerald-100">Hero image</p>
              <p className="mt-1">
                The hero image is the primary photo buyers see first on your listing preview (lead photo). Paste a
                public URL, or upload a file — either satisfies this step.
              </p>
            </div>
            <div className="mt-3">
              <Hint>Additional gallery photos are optional and can be uploaded below.</Hint>
            </div>
            <Field
              label="Hero image URL (or upload below)"
              id="heroImageUrl"
              defaultValue={draftValue("heroImageUrl")}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                id="hero-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadHeroFile(file);
                }}
              />
              <button
                type="button"
                disabled={heroUploadBusy || savingSection === "photos-media"}
                onClick={() => document.getElementById("hero-image-file")?.click()}
                className="rounded-full border border-emerald-400/60 bg-emerald-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {heroUploadBusy ? "Uploading hero…" : "Upload hero image"}
              </button>
            </div>
            {listing.heroImageUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-emerald-500/30 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element -- proxy/external URL, no Image optimizer */}
                <img
                  src={listing.heroImageUrl}
                  alt="Hero preview"
                  className="block max-h-80 w-full object-cover"
                />
              </div>
            ) : null}
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/55">Additional photos (optional)</p>
              <p className="mt-1 text-xs text-white/55">
                Upload extra images for your gallery. These are not required to submit setup.
              </p>
              <input
                id="gallery-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadGalleryFile(file);
                }}
              />
              <button
                type="button"
                disabled={galleryUploadBusy || savingSection === "photos-media"}
                onClick={() => document.getElementById("gallery-image-file")?.click()}
                className="mt-3 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {galleryUploadBusy ? "Uploading…" : "Upload additional photo"}
              </button>
              {listing.additionalPhotoUrls.length > 0 ? (
                <ul className="mt-3 grid gap-2 text-xs">
                  {listing.additionalPhotoUrls.map((url) => (
                    <li
                      key={url}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-emerald-100/90"
                    >
                      <span className="min-w-0 truncate font-mono text-[11px]">{url}</span>
                      <button
                        type="button"
                        onClick={() => removeGalleryUrl(url)}
                        className="shrink-0 rounded border border-white/15 px-2 py-0.5 text-[11px] text-white/70 hover:bg-white/10"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <CheckboxRow
                id="firstPhotoExteriorConfirmed"
                label="First MLS photo will be an exterior shot"
                defaultChecked={listing.firstPhotoExteriorConfirmed}
              />
              <CheckboxRow
                id="photoNoSignsConfirmed"
                label="Photos will not include signs or branding"
                defaultChecked={listing.photoNoSignsConfirmed}
              />
              <CheckboxRow
                id="photoNoPeoplePetsConfirmed"
                label="Photos will not include identifiable people or pets"
                defaultChecked={listing.photoNoPeoplePetsConfirmed}
              />
              <CheckboxRow
                id="photoCopyrightConfirmed"
                label="I own or have rights to use these photos"
                defaultChecked={listing.photoCopyrightConfirmed}
              />
              <CheckboxRow
                id="isInMudWaterDistrict"
                label="Property is in a MUD / water district (notice upload may be required)"
                defaultChecked={listing.isInMudWaterDistrict}
              />
            </div>
            {listing.lockboxOrKeypad ? (
              <div className="mt-4 space-y-2 rounded-xl border border-amber-400/25 bg-amber-950/15 p-3">
                <CheckboxRow
                  id="keyboxPermission"
                  label="I authorize electronic lockbox / keypad access"
                  defaultChecked={listing.keyboxPermission}
                />
                <CheckboxRow
                  id="keyboxRiskAcknowledged"
                  label="I understand lockbox risks"
                  defaultChecked={listing.keyboxRiskAcknowledged}
                />
              </div>
            ) : null}
            <SaveBar
              busy={savingSection === "photos-media"}
              onSave={() => {
                void savePatch("photos-media", {
                  heroImageUrl: (document.getElementById("heroImageUrl") as HTMLInputElement)?.value ?? "",
                  firstPhotoExteriorConfirmed:
                    (document.getElementById("firstPhotoExteriorConfirmed") as HTMLInputElement)?.checked ?? false,
                  photoNoSignsConfirmed:
                    (document.getElementById("photoNoSignsConfirmed") as HTMLInputElement)?.checked ?? false,
                  photoNoPeoplePetsConfirmed:
                    (document.getElementById("photoNoPeoplePetsConfirmed") as HTMLInputElement)?.checked ?? false,
                  photoCopyrightConfirmed:
                    (document.getElementById("photoCopyrightConfirmed") as HTMLInputElement)?.checked ?? false,
                  isInMudWaterDistrict:
                    (document.getElementById("isInMudWaterDistrict") as HTMLInputElement)?.checked ?? false,
                  keyboxPermission: (document.getElementById("keyboxPermission") as HTMLInputElement | null)?.checked ?? false,
                  keyboxRiskAcknowledged:
                    (document.getElementById("keyboxRiskAcknowledged") as HTMLInputElement | null)?.checked ?? false,
                });
              }}
            />
          </InfoCard>

          <InfoCard
            id="complete-listing-setup"
            title="Step 6 — Review & finalize"
            complete={steps.find((s) => s.id === "complete-listing-setup")?.complete ?? false}
            missingItems={missingByStep["complete-listing-setup"] ?? []}
          >
            <InfoGrid
              items={[
                ["Plan", listing.planLabel || "Attached at purchase"],
                ["Ordered", formatDate(listing.orderedOn)],
                ["Setup finalized", formatDate(listing.setupFinalizedAt)],
              ]}
            />

            <Subheading className="mt-6">Listing start & brokerage acknowledgments</Subheading>
            <Hint>
              Your listing is scheduled to go active on the start date you choose. If that date is today or already past
              when we finalize, it becomes Active immediately; future dates stay Pending until the start day.
            </Hint>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field
                label="Listing period start *"
                id="listingStartOn"
                type="date"
                defaultValue={dateInputValue(listing.listingStartOn)}
              />
            </div>
            <CheckboxRow
              id="intermediaryStatusAuthorized"
              label="I authorize brokerage intermediary status disclosures *"
              defaultChecked={listing.intermediaryStatusAuthorized}
            />

            <Subheading className="mt-6">MLS compliance confirmations</Subheading>
            <div className="space-y-2">
              <CheckboxRow
                id="fairHousingNoticeConfirmed"
                label="Fair housing notice reviewed *"
                defaultChecked={listing.fairHousingNoticeConfirmed}
              />
              <CheckboxRow
                id="valuablesNoticeConfirmed"
                label="Valuables / security notice reviewed *"
                defaultChecked={listing.valuablesNoticeConfirmed}
              />
              <CheckboxRow
                id="iabsAcknowledged"
                label="Information About Brokerage Services (IABS) acknowledged *"
                defaultChecked={listing.iabsAcknowledged}
              />
              <CheckboxRow
                id="sellersDisclosureAcknowledged"
                label="Seller disclosure duties acknowledged *"
                defaultChecked={listing.sellersDisclosureAcknowledged}
              />
              <CheckboxRow
                id="brokerBrandingConfirmed"
                label="Broker branding / advertising rules confirmed *"
                defaultChecked={listing.brokerBrandingConfirmed}
              />
            </div>

            <Subheading className="mt-6">Summary attestations</Subheading>
            <CheckboxRow
              id="informationAccurateConfirmed"
              label="I verified that the information provided is accurate *"
              defaultChecked={listing.informationAccurateConfirmed}
            />
            <div className="mt-3 space-y-2">
              <FieldLabel>Were you referred by an existing customer? *</FieldLabel>
              <RadioYesNo name="referredByExistingCustomer" defaultYes={listing.referredByExistingCustomer} />
            </div>
            <div className="mt-3 space-y-2">
              <FieldLabel>Would you like to provide feedback on this listing process? *</FieldLabel>
              <RadioYesNo name="wantsListingProcessFeedback" defaultYes={listing.wantsListingProcessFeedback} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Listing status (manual override)"
                id="status-complete"
                defaultValue={listing.status}
                options={[
                  { value: "INCOMPLETE", label: "Incomplete" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "PENDING", label: "Pending" },
                  { value: "EXPIRED", label: "Expired" },
                  { value: "SOLD", label: "Sold" },
                ]}
              />
            </div>

            <SaveBar
              busy={savingSection === "complete"}
              onSave={() => {
                void savePatch("complete", {
                  listingStartOn: readOptionalDate("listingStartOn"),
                  intermediaryStatusAuthorized:
                    (document.getElementById("intermediaryStatusAuthorized") as HTMLInputElement)?.checked ?? false,
                  fairHousingNoticeConfirmed:
                    (document.getElementById("fairHousingNoticeConfirmed") as HTMLInputElement)?.checked ?? false,
                  valuablesNoticeConfirmed:
                    (document.getElementById("valuablesNoticeConfirmed") as HTMLInputElement)?.checked ?? false,
                  iabsAcknowledged: (document.getElementById("iabsAcknowledged") as HTMLInputElement)?.checked ?? false,
                  sellersDisclosureAcknowledged:
                    (document.getElementById("sellersDisclosureAcknowledged") as HTMLInputElement)?.checked ?? false,
                  brokerBrandingConfirmed:
                    (document.getElementById("brokerBrandingConfirmed") as HTMLInputElement)?.checked ?? false,
                  informationAccurateConfirmed:
                    (document.getElementById("informationAccurateConfirmed") as HTMLInputElement)?.checked ?? false,
                  referredByExistingCustomer: readYesNo(
                    "referredByExistingCustomer",
                    listing.referredByExistingCustomer,
                  ),
                  wantsListingProcessFeedback: readYesNo(
                    "wantsListingProcessFeedback",
                    listing.wantsListingProcessFeedback,
                  ),
                  status: (document.getElementById("status-complete") as HTMLSelectElement)?.value,
                });
              }}
            />

            <p className="mt-4 text-xs text-white/60">
              Finalize runs automated validation (documents, HOA/condo rules, etc.). Submissions move to Active when your
              listing start date is today or earlier; future start dates remain Pending until that calendar day.
            </p>
            <button
              type="button"
              disabled={!canFinalize || finalizing || listing.status !== "INCOMPLETE"}
              onClick={() => void finalizeSetup()}
              className="mt-3 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {finalizing ? "Finalizing..." : listing.status !== "INCOMPLETE" ? "Already finalized" : "Finalize listing"}
            </button>
          </InfoCard>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-emerald-500/25 pt-4">
          {prevStep ? (
            <a
              href={`#${prevStep.id}`}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/35 hover:bg-white/10"
            >
              Previous step
            </a>
          ) : null}
          {nextStep ? (
            <a
              href={`#${nextStep.id}`}
              className="rounded-full border border-cyan-400/45 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/70 hover:bg-cyan-400/20"
            >
              Next step
            </a>
          ) : null}
          <Link
            href="/dashboard"
            className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30"
          >
            Back to dashboard
          </Link>
          <Link
            href="/upgrades"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/35 hover:bg-white/10"
          >
            Listing upgrades
          </Link>
        </div>
      </section>

      {showPhotoDisclaimer ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-emerald-500/35 bg-black/90 p-6 shadow-[0_20px_60px_rgba(2,6,3,0.65)]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-emerald-100">Photo upload reminder</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPhotoDisclaimer(false);
                  setPendingAnchor(null);
                }}
                className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <p className="mt-3 text-sm text-white/80">Confirm MLS-ready imagery before you edit Step 5:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-white/85">
              <li>Use photos you created, licensed, or own.</li>
              <li>Lead with an exterior shot.</li>
              <li>Avoid visible signage or marketing overlays.</li>
            </ol>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={acceptPhotoDisclaimer}
                className="rounded-full border border-emerald-400/60 bg-emerald-500/25 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({ id, title, complete, missingItems, children }: InfoCardProps) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-white/10 bg-emerald-950/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/80">{title}</h2>
        <span
          className={[
            "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
            complete
              ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
              : "border-amber-300/45 bg-amber-500/15 text-amber-100",
          ].join(" ")}
        >
          {complete ? "Complete" : "Needs input"}
        </span>
      </div>
      {!complete && missingItems.length > 0 ? (
        <p className="mt-2 text-xs text-amber-100/85">Missing: {missingItems.join(", ")}</p>
      ) : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

type InfoCardProps = {
  id: string;
  title: string;
  complete: boolean;
  missingItems: string[];
  children: ReactNode;
};

function Field({
  id,
  label,
  defaultValue,
  type = "text",
}: {
  id: string;
  label: string;
  defaultValue: string;
  type?: "text" | "number" | "email" | "tel" | "date";
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-xs font-semibold uppercase tracking-wide text-white/55">{label}</span>
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-emerald-100 outline-none ring-emerald-300/40 transition focus:ring"
      />
    </label>
  );
}

function SelectField({
  id,
  label,
  defaultValue,
  options,
}: {
  id: string;
  label: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-xs font-semibold uppercase tracking-wide text-white/55">{label}</span>
      <select
        id={id}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-emerald-100 outline-none ring-emerald-300/40 transition focus:ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900 text-emerald-100">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-white/55">{label}</dt>
          <dd className="mt-1 text-sm text-emerald-100">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Subheading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={["text-sm font-semibold text-emerald-100/95", className].filter(Boolean).join(" ")}>{children}</p>;
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-white/60">{children}</p>;
}

function FieldLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={["text-xs font-semibold uppercase tracking-wide text-white/55", className].join(" ")}>{children}</span>;
}

function RadioYesNo({ name, defaultYes }: { name: string; defaultYes: boolean }) {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-emerald-100">
      <label className="flex cursor-pointer items-center gap-2">
        <input type="radio" name={name} value="yes" defaultChecked={defaultYes} className="accent-emerald-400" />
        Yes
      </label>
      <label className="flex cursor-pointer items-center gap-2">
        <input type="radio" name={name} value="no" defaultChecked={!defaultYes} className="accent-emerald-400" />
        No
      </label>
    </div>
  );
}

function AssociationRadios({ defaultValue }: { defaultValue: string }) {
  const opts = [
    { value: "HOA", label: "HOA" },
    { value: "CONDO", label: "Condo association" },
    { value: "NONE", label: "No association" },
  ];
  return (
    <div className="flex flex-wrap gap-4 text-sm text-emerald-100">
      {opts.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="associationType"
            value={o.value}
            defaultChecked={defaultValue === o.value}
            className="accent-emerald-400"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function CheckboxRow({ id, label, defaultChecked }: { id: string; label: string; defaultChecked: boolean }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer gap-2 text-sm text-emerald-50">
      <input id={id} type="checkbox" defaultChecked={defaultChecked} className="mt-0.5 accent-emerald-400" />
      {label}
    </label>
  );
}

function SaveBar({ busy, onSave }: { busy: boolean; onSave: () => void }) {
  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={busy}
        onClick={onSave}
        className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Saving..." : "Save section"}
      </button>
    </div>
  );
}

function CharCountArea({
  id,
  label,
  maxLength,
  defaultValue,
  hint,
}: {
  id: string;
  label: string;
  maxLength: number;
  defaultValue: string;
  hint?: string;
}) {
  const [count, setCount] = useState(Math.min(defaultValue.length, maxLength));
  return (
    <div className="mt-4">
      <label htmlFor={id}>
        <span className="text-xs font-semibold uppercase tracking-wide text-white/55">{label}</span>
        <textarea
          id={id}
          rows={6}
          maxLength={maxLength}
          defaultValue={(defaultValue ?? "").slice(0, maxLength)}
          onChange={(e) => setCount(e.target.value.length)}
          className="mt-1 w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-emerald-100 outline-none ring-emerald-300/40 focus:ring"
        />
      </label>
      <p className="mt-1 text-xs text-white/55">
        {count} / {maxLength} characters
      </p>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}
