"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { staticWizardUpgrades } from "@/data/pricing-static-upgrades";

export type DashboardListing = {
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
  propertyType: "SINGLE_FAMILY" | "CONDOMINIUM";
  parcelId: string;
  sellerNames: string;
  contactPhone: string;
  contactEmail: string;
  feeSimpleConfirmed: boolean;
  tenantOccupied: boolean;
  namedSubdivision: boolean;
  subdivisionName: string;
  associationType: "HOA" | "CONDO" | "NONE";
  newConstruction: boolean;
  septicSystem: boolean;
  hasPool: boolean;
  lockboxOrKeypad: boolean;
  lockboxInstructions: string;
  ownershipType: "INDIVIDUAL" | "MARRIED_COUPLE" | "DECEASED_ESTATE" | "BUSINESS_ENTITY";
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
  buyerAgentCompType: "PERCENT" | "AMOUNT";
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
};

type ListingDocumentItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  documentType?: string;
  signatureStatus?: "NOT_REQUESTED" | "REQUESTED" | "SIGNED";
  createdAt: string | null;
};

type ListingOfferItem = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
  message: string;
  status: string;
  statusNote: string;
  createdAt: string | null;
};

type ListingUpgradeRequestItem = {
  id: string;
  slug: string;
  upgradeName: string;
  amount: number;
  status: string;
  requestNote: string;
  reconciliationRef: string;
  statusNote: string;
  createdAt: string | null;
};

type ListingOpenHouseItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  notes: string;
  status: string;
  createdAt: string | null;
};

type ListingMlsExportJob = {
  id: string;
  status: string;
  progress: number;
  fileName: string;
  error: string;
  completedAt: string | null;
};

const statusOptions = ["INCOMPLETE", "ACTIVE", "PENDING", "EXPIRED", "SOLD"] as const;
const previewListings: DashboardListing[] = [
  {
    id: "preview-listing-1",
    street: "1234 Lakeshore Dr",
    unit: "",
    city: "Austin",
    state: "TX",
    zip: "78704",
    county: "Travis",
    legalLot: "",
    legalBlock: "",
    legalAddition: "",
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
    hasPool: false,
    lockboxOrKeypad: false,
    lockboxInstructions: "",
    ownershipType: "INDIVIDUAL",
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
    mlsName: "Austin Board of Realtors",
    mlsNumber: "ABR-1234567",
    listingId: "LISTQIK-1001",
    status: "INCOMPLETE",
    planLabel: "Gold Plan · 25 photos",
    price: 545000,
    buyerAgentCompPct: 2.5,
    description:
      "Beautifully updated single-story home with open kitchen, covered patio, and quick access to downtown Austin.",
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
    orderedOn: "2026-04-12T08:00:00.000Z",
    listedOn: null,
    expiresOn: null,
  },
  {
    id: "preview-listing-2",
    street: "8702 Meadow Park Ln",
    unit: "",
    city: "Houston",
    state: "TX",
    zip: "77064",
    county: "Harris",
    legalLot: "",
    legalBlock: "",
    legalAddition: "",
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
    hasPool: false,
    lockboxOrKeypad: false,
    lockboxInstructions: "",
    ownershipType: "INDIVIDUAL",
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
    mlsName: "Houston Association of Realtors",
    mlsNumber: "HAR-8923410",
    listingId: "LISTQIK-1002",
    status: "ACTIVE",
    planLabel: "Platinum Plan · 40 photos",
    price: 429000,
    buyerAgentCompPct: 3,
    description:
      "Move-in ready two-story with upgraded kitchen, large backyard, and convenient freeway access.",
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
    orderedOn: "2026-03-22T08:00:00.000Z",
    listedOn: "2026-03-30T08:00:00.000Z",
    expiresOn: "2026-09-30T08:00:00.000Z",
  },
  {
    id: "preview-listing-3",
    street: "4517 Mesa Ridge Ct",
    unit: "Unit B",
    city: "San Antonio",
    state: "TX",
    zip: "78230",
    county: "Bexar",
    legalLot: "",
    legalBlock: "",
    legalAddition: "",
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
    hasPool: false,
    lockboxOrKeypad: false,
    lockboxInstructions: "",
    ownershipType: "INDIVIDUAL",
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
    mlsName: "San Antonio Board of Realtors",
    mlsNumber: "SABOR-5512098",
    listingId: "LISTQIK-1003",
    status: "PENDING",
    planLabel: "Silver Plan · 15 photos",
    price: 318000,
    buyerAgentCompPct: 2.75,
    description:
      "Updated condo with modern finishes, private patio, and quick access to major shopping and dining areas.",
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
    orderedOn: "2026-02-10T08:00:00.000Z",
    listedOn: "2026-02-20T08:00:00.000Z",
    expiresOn: "2026-08-20T08:00:00.000Z",
  },
];

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string | null) {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function ListingDashboard() {
  const [listings, setListings] = useState<DashboardListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null);
  const [loadingDocumentsId, setLoadingDocumentsId] = useState<string | null>(null);
  const [documentsByListing, setDocumentsByListing] = useState<Record<string, ListingDocumentItem[]>>({});
  const [offersByListing, setOffersByListing] = useState<Record<string, ListingOfferItem[]>>({});
  const [upgradesByListing, setUpgradesByListing] = useState<Record<string, ListingUpgradeRequestItem[]>>({});
  const [loadingOffersId, setLoadingOffersId] = useState<string | null>(null);
  const [loadingUpgradesId, setLoadingUpgradesId] = useState<string | null>(null);
  const [savingOfferId, setSavingOfferId] = useState<string | null>(null);
  const [savingUpgradeId, setSavingUpgradeId] = useState<string | null>(null);
  const [activeOfferListingId, setActiveOfferListingId] = useState<string | null>(null);
  const [activeUpgradeListingId, setActiveUpgradeListingId] = useState<string | null>(null);
  const [openHousesByListing, setOpenHousesByListing] = useState<Record<string, ListingOpenHouseItem[]>>({});
  const [loadingOpenHousesId, setLoadingOpenHousesId] = useState<string | null>(null);
  const [savingOpenHouseId, setSavingOpenHouseId] = useState<string | null>(null);
  const [activeOpenHouseListingId, setActiveOpenHouseListingId] = useState<string | null>(null);
  const [mlsJobByListing, setMlsJobByListing] = useState<Record<string, ListingMlsExportJob | null>>({});
  const [exportingListingId, setExportingListingId] = useState<string | null>(null);
  const [guidedActionByListing, setGuidedActionByListing] = useState<Record<string, "edit" | "status" | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/listings", { cache: "no-store" });
      if (res.status === 401) {
        setPreviewMode(true);
        setListings(previewListings);
        setExpanded(previewListings[0]?.id ?? null);
        return;
      }
      const data = (await res.json()) as { ok?: boolean; listings?: DashboardListing[]; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not load listings.");
        setListings([]);
        return;
      }
      setPreviewMode(false);
      const list = data.listings ?? [];
      setListings(list);
      setExpanded((prev) => prev ?? list[0]?.id ?? null);
    } catch {
      setPreviewMode(true);
      setError(null);
      setListings(previewListings);
      setExpanded(previewListings[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addressLine = useMemo(
    () => (l: DashboardListing) =>
      [l.street, l.unit, [l.city, l.state].filter(Boolean).join(", "), l.zip].filter(Boolean).join(" · "),
    [],
  );

  async function patchListing(id: string, body: Record<string, unknown>) {
    if (previewMode) {
      return;
    }
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }
      await load();
    } catch {
      setError("Network error while saving.");
    } finally {
      setSavingId(null);
    }
  }

  async function uploadHeroImage(id: string, file: File) {
    if (previewMode) {
      return;
    }
    setUploadError(null);
    setUploadingId(id);
    setError(null);
    try {
      const signedRes = await fetch(`/api/dashboard/listings/${id}/hero-image/upload-url`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });
      const signedData = (await signedRes.json()) as
        | { ok?: boolean; uploadUrl?: string; publicUrl?: string; error?: string }
        | null;
      if (!signedRes.ok || !signedData?.ok || !signedData.uploadUrl || !signedData.publicUrl) {
        setUploadError(signedData?.error ?? "Could not prepare image upload.");
        return;
      }

      const uploadRes = await fetch(signedData.uploadUrl, {
        method: "PUT",
        headers: {
          "content-type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        setUploadError("Upload failed while sending image to storage.");
        return;
      }

      await patchListing(id, { heroImageUrl: signedData.publicUrl });
    } catch {
      setUploadError("Network error while uploading image.");
    } finally {
      setUploadingId(null);
    }
  }

  const loadDocuments = useCallback(async (id: string) => {
    if (previewMode) return;
    setLoadingDocumentsId(id);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/documents`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; documents?: ListingDocumentItem[]; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not load listing documents.");
        return;
      }
      setDocumentsByListing((prev) => ({ ...prev, [id]: data.documents ?? [] }));
    } catch {
      setUploadError("Network error while loading documents.");
    } finally {
      setLoadingDocumentsId(null);
    }
  }, [previewMode]);

  async function uploadDocument(id: string, file: File) {
    if (previewMode) return;
    setUploadError(null);
    setUploadingDocumentId(id);
    try {
      const signedRes = await fetch(`/api/dashboard/listings/${id}/documents/upload-url`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });
      const signedData = (await signedRes.json().catch(() => null)) as
        | { ok?: boolean; uploadUrl?: string; publicUrl?: string; error?: string }
        | null;
      if (!signedRes.ok || !signedData?.ok || !signedData.uploadUrl || !signedData.publicUrl) {
        setUploadError(signedData?.error ?? "Could not prepare document upload.");
        return;
      }

      const uploadRes = await fetch(signedData.uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) {
        setUploadError("Document upload failed while sending file to storage.");
        return;
      }

      const saveRes = await fetch(`/api/dashboard/listings/${id}/documents`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl: signedData.publicUrl,
        }),
      });
      const saveData = (await saveRes.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!saveRes.ok || !saveData?.ok) {
        setUploadError(saveData?.error ?? "Could not save document metadata.");
        return;
      }

      await loadDocuments(id);
    } catch {
      setUploadError("Network error while uploading document.");
    } finally {
      setUploadingDocumentId(null);
    }
  }

  async function generateLegalPackage(id: string) {
    if (previewMode) return;
    setUploadError(null);
    setUploadingDocumentId(id);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/legal-package`, { method: "POST" });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not generate legal package.");
        return;
      }
      await loadDocuments(id);
    } catch {
      setUploadError("Network error while generating legal package.");
    } finally {
      setUploadingDocumentId(null);
    }
  }

  async function requestSignature(id: string, documentId: string) {
    if (previewMode) return;
    setUploadError(null);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/signatures`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentId, action: "REQUEST", provider: "MANUAL" }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not request signature.");
        return;
      }
      await loadDocuments(id);
    } catch {
      setUploadError("Network error while requesting signature.");
    }
  }

  async function markSigned(id: string, documentId: string) {
    if (previewMode) return;
    setUploadError(null);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/signatures`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentId, action: "MARK_SIGNED" }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not mark signature as signed.");
        return;
      }
      await loadDocuments(id);
    } catch {
      setUploadError("Network error while updating signature.");
    }
  }

  const loadOffers = useCallback(async (id: string) => {
    if (previewMode) return;
    setLoadingOffersId(id);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/offers`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; offers?: ListingOfferItem[]; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not load offers.");
        return;
      }
      setOffersByListing((prev) => ({ ...prev, [id]: data.offers ?? [] }));
    } catch {
      setUploadError("Network error while loading offers.");
    } finally {
      setLoadingOffersId(null);
    }
  }, [previewMode]);

  async function submitOffer(id: string) {
    if (previewMode) return;
    const buyerName = (document.getElementById(`offer-buyerName-${id}`) as HTMLInputElement | null)?.value ?? "";
    const buyerEmail = (document.getElementById(`offer-buyerEmail-${id}`) as HTMLInputElement | null)?.value ?? "";
    const buyerPhone = (document.getElementById(`offer-buyerPhone-${id}`) as HTMLInputElement | null)?.value ?? "";
    const amount = Number((document.getElementById(`offer-amount-${id}`) as HTMLInputElement | null)?.value ?? "");
    const message = (document.getElementById(`offer-message-${id}`) as HTMLTextAreaElement | null)?.value ?? "";
    if (!buyerName.trim() || !Number.isFinite(amount) || amount <= 0) {
      setUploadError("Offer needs buyer name and a valid amount.");
      return;
    }
    setSavingOfferId(id);
    setUploadError(null);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/offers`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ buyerName, buyerEmail, buyerPhone, amount, message }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; notification?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not save offer.");
        return;
      }
      await loadOffers(id);
      if (data.notification) {
        setError(data.notification);
      }
    } catch {
      setUploadError("Network error while saving offer.");
    } finally {
      setSavingOfferId(null);
    }
  }

  async function updateOfferStatus(listingId: string, offerId: string, status: string) {
    if (previewMode) return;
    setSavingOfferId(listingId);
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/offers/${offerId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; notification?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not update offer status.");
        return;
      }
      await loadOffers(listingId);
      if (data.notification) {
        setError(data.notification);
      }
    } catch {
      setUploadError("Network error while updating offer.");
    } finally {
      setSavingOfferId(null);
    }
  }

  const loadUpgrades = useCallback(async (id: string) => {
    if (previewMode) return;
    setLoadingUpgradesId(id);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/upgrades`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; requests?: ListingUpgradeRequestItem[]; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not load upgrade requests.");
        return;
      }
      setUpgradesByListing((prev) => ({ ...prev, [id]: data.requests ?? [] }));
    } catch {
      setUploadError("Network error while loading upgrades.");
    } finally {
      setLoadingUpgradesId(null);
    }
  }, [previewMode]);

  const loadOpenHouses = useCallback(async (id: string) => {
    if (previewMode) return;
    setLoadingOpenHousesId(id);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/open-houses`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; openHouses?: ListingOpenHouseItem[]; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not load open houses.");
        return;
      }
      setOpenHousesByListing((prev) => ({ ...prev, [id]: data.openHouses ?? [] }));
    } catch {
      setUploadError("Network error while loading open houses.");
    } finally {
      setLoadingOpenHousesId(null);
    }
  }, [previewMode]);

  async function scheduleOpenHouse(id: string) {
    if (previewMode) return;
    const title = (document.getElementById(`openhouse-title-${id}`) as HTMLInputElement | null)?.value ?? "";
    const startAtLocal = (document.getElementById(`openhouse-start-${id}`) as HTMLInputElement | null)?.value ?? "";
    const endAtLocal = (document.getElementById(`openhouse-end-${id}`) as HTMLInputElement | null)?.value ?? "";
    const notes = (document.getElementById(`openhouse-notes-${id}`) as HTMLInputElement | null)?.value ?? "";
    if (!title.trim() || !startAtLocal || !endAtLocal) {
      setUploadError("Open house requires title, start, and end.");
      return;
    }
    setSavingOpenHouseId(id);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/open-houses`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          startAt: new Date(startAtLocal).toISOString(),
          endAt: new Date(endAtLocal).toISOString(),
          notes,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not schedule open house.");
        return;
      }
      await loadOpenHouses(id);
    } catch {
      setUploadError("Network error while scheduling open house.");
    } finally {
      setSavingOpenHouseId(null);
    }
  }

  async function updateOpenHouseStatus(listingId: string, openHouseId: string, status: string) {
    if (previewMode) return;
    setSavingOpenHouseId(listingId);
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/open-houses/${openHouseId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not update open house.");
        return;
      }
      await loadOpenHouses(listingId);
    } catch {
      setUploadError("Network error while updating open house.");
    } finally {
      setSavingOpenHouseId(null);
    }
  }

  async function deleteOpenHouse(listingId: string, openHouseId: string) {
    if (previewMode) return;
    setSavingOpenHouseId(listingId);
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/open-houses/${openHouseId}`, {
        method: "DELETE",
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not delete open house.");
        return;
      }
      await loadOpenHouses(listingId);
    } catch {
      setUploadError("Network error while deleting open house.");
    } finally {
      setSavingOpenHouseId(null);
    }
  }

  const loadMlsExportJob = useCallback(async (listingId: string) => {
    if (previewMode) return;
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/mls-export`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; job?: ListingMlsExportJob | null; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        return;
      }
      setMlsJobByListing((prev) => ({ ...prev, [listingId]: data.job ?? null }));
    } catch {
      // no-op
    }
  }, [previewMode]);

  async function startMlsExport(listingId: string) {
    if (previewMode) return;
    setExportingListingId(listingId);
    setUploadError(null);
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/mls-export`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; job?: ListingMlsExportJob; error?: string }
        | null;
      if (!res.ok || !data?.ok || !data.job?.id) {
        setUploadError(data?.error ?? "Could not start MLS export.");
        return;
      }
      setMlsJobByListing((prev) => ({ ...prev, [listingId]: data.job ?? null }));
    } catch {
      setUploadError("Network error while starting MLS export.");
    } finally {
      setExportingListingId(null);
    }
  }

  const pollMlsExport = useCallback(async (listingId: string, jobId: string) => {
    if (previewMode) return;
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/mls-export/${jobId}`, { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; job?: ListingMlsExportJob; error?: string }
        | null;
      const job = data?.ok ? data.job : undefined;
      if (!res.ok || !job) {
        return;
      }
      setMlsJobByListing((prev) => ({ ...prev, [listingId]: job }));
    } catch {
      // no-op
    }
  }, [previewMode]);

  async function submitUpgradeRequest(id: string) {
    if (previewMode) return;
    const slug = (document.getElementById(`upgrade-slug-${id}`) as HTMLSelectElement | null)?.value ?? "";
    const amount = Number((document.getElementById(`upgrade-amount-${id}`) as HTMLInputElement | null)?.value ?? "");
    const requestNote = (document.getElementById(`upgrade-note-${id}`) as HTMLInputElement | null)?.value ?? "";
    if (!slug || !Number.isFinite(amount) || amount < 0) {
      setUploadError("Upgrade request needs a selected upgrade and valid amount.");
      return;
    }
    setSavingUpgradeId(id);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}/upgrades`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, amount, requestNote }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; notification?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not create upgrade request.");
        return;
      }
      await loadUpgrades(id);
      if (data.notification) {
        setError(data.notification);
      }
    } catch {
      setUploadError("Network error while creating upgrade request.");
    } finally {
      setSavingUpgradeId(null);
    }
  }

  async function updateUpgradeStatus(listingId: string, requestId: string, status: string) {
    if (previewMode) return;
    setSavingUpgradeId(listingId);
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/upgrades/${requestId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; notification?: string } | null;
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error ?? "Could not update upgrade request status.");
        return;
      }
      await loadUpgrades(listingId);
      if (data.notification) {
        setError(data.notification);
      }
    } catch {
      setUploadError("Network error while updating upgrade request.");
    } finally {
      setSavingUpgradeId(null);
    }
  }

  useEffect(() => {
    if (!expanded || previewMode) return;
    if (documentsByListing[expanded]) return;
    void loadDocuments(expanded);
  }, [documentsByListing, expanded, previewMode, loadDocuments]);

  useEffect(() => {
    if (!expanded || previewMode || !activeOfferListingId) return;
    if (activeOfferListingId !== expanded) return;
    if (offersByListing[expanded]) return;
    void loadOffers(expanded);
  }, [activeOfferListingId, expanded, offersByListing, previewMode, loadOffers]);

  useEffect(() => {
    if (!expanded || previewMode || !activeUpgradeListingId) return;
    if (activeUpgradeListingId !== expanded) return;
    if (upgradesByListing[expanded]) return;
    void loadUpgrades(expanded);
  }, [activeUpgradeListingId, expanded, previewMode, upgradesByListing, loadUpgrades]);

  useEffect(() => {
    if (!expanded || previewMode || !activeOpenHouseListingId) return;
    if (activeOpenHouseListingId !== expanded) return;
    if (openHousesByListing[expanded]) return;
    void loadOpenHouses(expanded);
  }, [activeOpenHouseListingId, expanded, previewMode, openHousesByListing, loadOpenHouses]);

  useEffect(() => {
    if (!expanded || previewMode) return;
    if (mlsJobByListing[expanded] !== undefined) return;
    void loadMlsExportJob(expanded);
  }, [expanded, previewMode, mlsJobByListing, loadMlsExportJob]);

  useEffect(() => {
    if (previewMode) return;
    const running = Object.entries(mlsJobByListing).filter(
      ([, job]) => job && (job.status === "QUEUED" || job.status === "PROCESSING"),
    );
    if (running.length === 0) return;
    const timer = window.setInterval(() => {
      running.forEach(([listingId, job]) => {
        if (job?.id) {
          void pollMlsExport(listingId, job.id);
        }
      });
    }, 1500);
    return () => {
      window.clearInterval(timer);
    };
  }, [mlsJobByListing, previewMode, pollMlsExport]);

  return (
    <div className="space-y-8">
      {previewMode ? (
        <div className="rounded-xl border border-amber-400/50 bg-amber-950/35 px-4 py-3 text-sm text-amber-100">
          Preview mode is active. Login is disabled for now, so dashboard edits are read-only.
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-rose-400/50 bg-rose-950/35 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}
      {uploadError ? (
        <div className="rounded-xl border border-rose-400/50 bg-rose-950/35 px-4 py-3 text-sm text-rose-100">
          {uploadError}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-white/70">Loading your listings…</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-white/70">No listings yet. Your listing appears here after you complete checkout or pricing intake.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map((l) => {
            const open = expanded === l.id;
            return (
              <li
                key={l.id}
                className="overflow-hidden rounded-2xl border border-emerald-500/25 bg-black/45 shadow-[0_0_18px_rgba(16,185,129,0.1)]"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
                  <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-emerald-950/25 sm:h-auto sm:w-44">
                    {l.heroImageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- user-provided URL */}
                        <img src={l.heroImageUrl} alt="" className="h-full w-full object-cover" />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-medium text-emerald-200/45">
                        No photo
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded border border-amber-300/40 bg-amber-500/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-100">
                      {l.status}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-emerald-100">{addressLine(l)}</p>
                        <p className="mt-1 text-sm text-white/70">
                          {l.planLabel || "Plan attached at purchase"}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-emerald-100">{formatMoney(l.price)}</p>
                        <p className="text-white/70">Buyer agent {l.buyerAgentCompPct ?? "—"}%</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/listings/${l.id}/setup`}
                        className="rounded-full border border-cyan-400/45 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-100 transition hover:border-cyan-300/70 hover:bg-cyan-400/20"
                      >
                        View listing setup
                      </Link>
                      <button
                        type="button"
                        onClick={() => setExpanded(open ? null : l.id)}
                        className="rounded-full border border-emerald-400/35 bg-emerald-950/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-900/35"
                      >
                        {open ? "Hide details" : "View details"}
                      </button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <button
                        type="button"
                        onClick={() => {
                          setExpanded(l.id);
                          setGuidedActionByListing((prev) => ({ ...prev, [l.id]: "edit" }));
                        }}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45"
                      >
                        Edit listing
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExpanded(l.id);
                          setGuidedActionByListing((prev) => ({ ...prev, [l.id]: "status" }));
                        }}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45"
                      >
                        Change status
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExpanded(l.id);
                          setActiveUpgradeListingId(l.id);
                          void loadUpgrades(l.id);
                        }}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45"
                      >
                        Upgrade your listing
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`doc-upload-${l.id}`) as HTMLInputElement | null;
                          input?.click();
                        }}
                        disabled={previewMode || uploadingDocumentId === l.id}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingDocumentId === l.id ? "Uploading document..." : "Upload document"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`photo-upload-${l.id}`) as HTMLInputElement | null;
                          input?.click();
                        }}
                        disabled={previewMode || uploadingId === l.id}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingId === l.id ? "Uploading photo..." : "Upload photo"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExpanded(l.id);
                          setActiveOpenHouseListingId(l.id);
                          void loadOpenHouses(l.id);
                        }}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45"
                      >
                        Schedule open house
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void startMlsExport(l.id);
                        }}
                        disabled={previewMode || exportingListingId === l.id}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {exportingListingId === l.id ? "Starting MLS export..." : "Download MLS listing"}
                      </button>
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-indigo-400/20 bg-indigo-950/20 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100/45"
                      >
                        Voice mail
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExpanded(l.id);
                          setActiveOfferListingId(l.id);
                          void loadOffers(l.id);
                        }}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45"
                      >
                        Offer from a buyer
                      </button>
                    </div>
                    <input
                      id={`photo-upload-${l.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={previewMode || uploadingId === l.id || savingId === l.id}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        e.currentTarget.value = "";
                        if (!file) return;
                        void uploadHeroImage(l.id, file);
                      }}
                    />
                    <input
                      id={`doc-upload-${l.id}`}
                      type="file"
                      className="hidden"
                      disabled={previewMode || uploadingDocumentId === l.id}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        e.currentTarget.value = "";
                        if (!file) return;
                        void uploadDocument(l.id, file);
                      }}
                    />
                  </div>
                </div>

                {open ? (
                  <div className="border-t border-emerald-500/20 bg-emerald-950/20 p-4 sm:p-6">
                    {guidedActionByListing[l.id] === "edit" ? (
                      <div className="mb-4 rounded-lg border border-cyan-300/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
                        Guided action: update description, price, and compensation, then click <strong>Save changes</strong>.
                      </div>
                    ) : null}
                    {guidedActionByListing[l.id] === "status" ? (
                      <div className="mb-4 rounded-lg border border-cyan-300/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
                        Guided action: select the new listing status in the status field, then click <strong>Save changes</strong>.
                      </div>
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Field label="County" value={l.county} />
                      <Field label="MLS name" value={l.mlsName} />
                      <Field label="MLS number" value={l.mlsNumber} />
                      <Field label="Listing ID" value={l.listingId} />
                      <Field label="Ordered on" value={formatDate(l.orderedOn)} />
                      <Field label="Listed on" value={formatDate(l.listedOn)} />
                      <Field label="Expires on" value={formatDate(l.expiresOn)} />
                    </div>

                    <div className="mt-6 space-y-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                        Step 1: General Information
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <input id={`street-${l.id}`} defaultValue={l.street} placeholder="Street" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 lg:col-span-2" />
                        <input id={`city-${l.id}`} defaultValue={l.city} placeholder="City" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`state-${l.id}`} defaultValue={l.state} placeholder="State" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`zip-${l.id}`} defaultValue={l.zip} placeholder="ZIP" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`county-${l.id}`} defaultValue={l.county} placeholder="County" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`legalLot-${l.id}`} defaultValue={l.legalLot} placeholder="Lot" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`legalBlock-${l.id}`} defaultValue={l.legalBlock} placeholder="Block" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`legalAddition-${l.id}`} defaultValue={l.legalAddition} placeholder="Addition name" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`parcelId-${l.id}`} defaultValue={l.parcelId} placeholder="Parcel ID" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <select id={`propertyType-${l.id}`} defaultValue={l.propertyType} className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50">
                          <option value="SINGLE_FAMILY">Single Family</option>
                          <option value="CONDOMINIUM">Condominium</option>
                        </select>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`namedSubdivision-${l.id}`} type="checkbox" defaultChecked={l.namedSubdivision} /> In named subdivision/condo complex</label>
                        <input id={`subdivisionName-${l.id}`} defaultValue={l.subdivisionName} placeholder="Subdivision/Condo name" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <select id={`associationType-${l.id}`} defaultValue={l.associationType} className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50">
                          <option value="NONE">No association</option>
                          <option value="HOA">HOA</option>
                          <option value="CONDO">Condo association</option>
                        </select>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`newConstruction-${l.id}`} type="checkbox" defaultChecked={l.newConstruction} /> New construction</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`septicSystem-${l.id}`} type="checkbox" defaultChecked={l.septicSystem} /> Has septic system</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`hasPool-${l.id}`} type="checkbox" defaultChecked={l.hasPool} /> Has pool</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`lockboxOrKeypad-${l.id}`} type="checkbox" defaultChecked={l.lockboxOrKeypad} /> Lockbox/keypad on property</label>
                        <input id={`lockboxInstructions-${l.id}`} defaultValue={l.lockboxInstructions} placeholder="Lockbox/keypad instructions" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 lg:col-span-2" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                        Step 2: Contact / Ownership
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <input id={`sellerNames-${l.id}`} defaultValue={l.sellerNames} placeholder="Seller legal names" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 lg:col-span-2" />
                        <input id={`contactPhone-${l.id}`} defaultValue={l.contactPhone} placeholder="Contact phone" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`contactEmail-${l.id}`} defaultValue={l.contactEmail} placeholder="Contact email" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <select id={`ownershipType-${l.id}`} defaultValue={l.ownershipType} className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50">
                          <option value="INDIVIDUAL">Owned by individual/trust</option>
                          <option value="MARRIED_COUPLE">Owned by married couple</option>
                          <option value="DECEASED_ESTATE">Deceased owner/estate</option>
                          <option value="BUSINESS_ENTITY">Owned by corporation/entity</option>
                        </select>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`feeSimple-${l.id}`} type="checkbox" defaultChecked={l.feeSimpleConfirmed} /> Fee simple title confirmed</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`tenantOccupied-${l.id}`} type="checkbox" defaultChecked={l.tenantOccupied} /> Tenant occupied</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`allOwnersOccupy-${l.id}`} type="checkbox" defaultChecked={l.allOwnersOccupyProperty} /> All owners occupy property</label>
                        <input id={`businessEntityName-${l.id}`} defaultValue={l.businessEntityName} placeholder="Business entity name (if applicable)" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 lg:col-span-2" />
                        <input id={`businessEntityRegisteredName-${l.id}`} defaultValue={l.businessEntityRegisteredName} placeholder="Entity registered legal name" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 lg:col-span-2" />
                        <input id={`businessEntitySignerName-${l.id}`} defaultValue={l.businessEntitySignerName} placeholder="Entity signer/principal name" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`businessEntitySignerTitle-${l.id}`} defaultValue={l.businessEntitySignerTitle} placeholder="Signer title/position" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`businessEntitySignerEmail-${l.id}`} defaultValue={l.businessEntitySignerEmail} placeholder="Signer email" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`allOwnersConsentEsign-${l.id}`} type="checkbox" defaultChecked={l.allOwnersConsentEsign} /> All owners consent to e-sign</label>
                        <input id={`appointmentPhone-${l.id}`} defaultValue={l.appointmentPhone} placeholder="Appointment phone number" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`appointmentPhoneCanText-${l.id}`} type="checkbox" defaultChecked={l.appointmentPhoneCanText} /> Appointment phone can receive text</label>
                        <input id={`alternatePhone-${l.id}`} defaultValue={l.alternatePhone} placeholder="Alternate phone" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`alternatePhoneCanText-${l.id}`} type="checkbox" defaultChecked={l.alternatePhoneCanText} /> Alternate phone can receive text</label>
                        <input id={`appointmentEmail-${l.id}`} defaultValue={l.appointmentEmail} placeholder="Appointment email address" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 lg:col-span-2" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                        Step 3: Price & Compensation
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <input id={`price-${l.id}`} type="number" defaultValue={l.price} placeholder="Listing price" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`flatFee-${l.id}`} type="number" defaultValue={l.flatFee ?? ""} placeholder="Flat fee" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`protectionDays-${l.id}`} type="number" defaultValue={l.protectionPeriodDays ?? ""} placeholder="Protection period days" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <select id={`buyerCompType-${l.id}`} defaultValue={l.buyerAgentCompType} className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50">
                          <option value="PERCENT">Buyer comp %</option>
                          <option value="AMOUNT">Buyer comp amount</option>
                        </select>
                        <input id={`bac-${l.id}`} type="number" step="0.01" defaultValue={l.buyerAgentCompPct ?? ""} placeholder="Buyer comp %" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`buyerCompAmount-${l.id}`} type="number" defaultValue={l.buyerAgentCompAmount ?? ""} placeholder="Buyer comp amount" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`listingStartOn-${l.id}`} type="date" defaultValue={l.listingStartOn ? l.listingStartOn.slice(0, 10) : ""} className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <input id={`listingEndOn-${l.id}`} type="date" defaultValue={l.listingEndOn ? l.listingEndOn.slice(0, 10) : ""} className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`intermediary-${l.id}`} type="checkbox" defaultChecked={l.intermediaryStatusAuthorized} /> Intermediary status authorized</label>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                        Step 4/5: Description, Remarks & Access
                      </p>
                      <div className="grid gap-3 lg:grid-cols-2">
                        <textarea id={`desc-${l.id}`} rows={3} defaultValue={l.description} placeholder="Public description" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <textarea id={`publicRemarks-${l.id}`} rows={3} defaultValue={l.publicRemarks} placeholder="Public remarks (no phone/website/contact)" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <textarea id={`privateRemarks-${l.id}`} rows={3} defaultValue={l.privateRemarks} placeholder="Private/agent remarks and showing instructions" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <textarea id={`drivingDirections-${l.id}`} rows={3} defaultValue={l.drivingDirections} placeholder="Basic driving directions" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <textarea id={`exclusions-${l.id}`} rows={3} defaultValue={l.exclusions} placeholder="Exclusions" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <textarea id={`improvements-${l.id}`} rows={3} defaultValue={l.improvementsAndAccessories} placeholder="Improvements & accessories staying" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <div className="grid gap-2">
                          <input id={`schedulingService-${l.id}`} defaultValue={l.schedulingService} placeholder="Scheduling service (ShowingTime/Brokerbay)" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                          <input id={`crossStreet-${l.id}`} defaultValue={l.crossStreet} placeholder="Cross street" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                          <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`hoaRequired-${l.id}`} type="checkbox" defaultChecked={l.hoaRequired} /> HOA mandatory</label>
                          <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`keyboxPermission-${l.id}`} type="checkbox" defaultChecked={l.keyboxPermission} /> Keybox permission granted</label>
                          <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`keyboxRisk-${l.id}`} type="checkbox" defaultChecked={l.keyboxRiskAcknowledged} /> Keybox risk acknowledged</label>
                        </div>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/80">
                        Step 6/7: Photos & Final Compliance
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`photoExterior-${l.id}`} type="checkbox" defaultChecked={l.firstPhotoExteriorConfirmed} /> Slot 1 is exterior</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`photoNoSigns-${l.id}`} type="checkbox" defaultChecked={l.photoNoSignsConfirmed} /> No signs/branding</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`photoNoPeoplePets-${l.id}`} type="checkbox" defaultChecked={l.photoNoPeoplePetsConfirmed} /> No people/pets</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`photoCopyright-${l.id}`} type="checkbox" defaultChecked={l.photoCopyrightConfirmed} /> Photo rights confirmed</label>
                        <input id={`yearBuilt-${l.id}`} type="number" defaultValue={l.yearBuilt ?? ""} placeholder="Year built" className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50" />
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`mudDistrict-${l.id}`} type="checkbox" defaultChecked={l.isInMudWaterDistrict} /> In statutory tax district</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`fairHousing-${l.id}`} type="checkbox" defaultChecked={l.fairHousingNoticeConfirmed} /> Fair housing reminder shown</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`valuables-${l.id}`} type="checkbox" defaultChecked={l.valuablesNoticeConfirmed} /> Security of valuables reminder shown</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`iabsAck-${l.id}`} type="checkbox" defaultChecked={l.iabsAcknowledged} /> IABS acknowledged</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`sellerDisclosureAck-${l.id}`} type="checkbox" defaultChecked={l.sellersDisclosureAcknowledged} /> Seller disclosure acknowledged</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`listingAgreementAck-${l.id}`} type="checkbox" defaultChecked={l.listingAgreementAcknowledged} /> Listing agreement acknowledged</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`brandingAck-${l.id}`} type="checkbox" defaultChecked={l.brokerBrandingConfirmed} /> Broker branding rule confirmed</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`infoAccurate-${l.id}`} type="checkbox" defaultChecked={l.informationAccurateConfirmed} /> I reviewed info and it is accurate</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`referredByExisting-${l.id}`} type="checkbox" defaultChecked={l.referredByExistingCustomer} /> Referred by existing customer</label>
                        <label className="flex items-center gap-2 text-xs text-emerald-100"><input id={`wantsFeedback-${l.id}`} type="checkbox" defaultChecked={l.wantsListingProcessFeedback} /> Wants to provide listing process feedback</label>
                        <label className="block text-sm sm:col-span-2 lg:col-span-4">
                          <span className="font-semibold text-emerald-100">Status</span>
                          <select
                            className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50"
                            defaultValue={l.status}
                            id={`status-${l.id}`}
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-sm sm:col-span-2 lg:col-span-4">
                          <span className="font-semibold text-emerald-100">Hero image upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-emerald-100"
                            disabled={previewMode || uploadingId === l.id || savingId === l.id}
                            onChange={(e) => {
                              const file = e.currentTarget.files?.[0];
                              e.currentTarget.value = "";
                              if (!file) return;
                              void uploadHeroImage(l.id, file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="mt-6 rounded-xl border border-emerald-500/20 bg-black/25 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200/80">Documents</p>
                        <button
                          type="button"
                          disabled={previewMode || uploadingDocumentId === l.id}
                          onClick={() => {
                            void generateLegalPackage(l.id);
                          }}
                          className="rounded-full border border-indigo-300/55 bg-indigo-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-100 transition hover:bg-indigo-400/25 disabled:opacity-50"
                        >
                          Generate legal package
                        </button>
                      </div>
                      {loadingDocumentsId === l.id ? (
                        <p className="mt-2 text-sm text-white/65">Loading documents...</p>
                      ) : (documentsByListing[l.id] ?? []).length === 0 ? (
                        <p className="mt-2 text-sm text-white/65">No documents uploaded yet.</p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {(documentsByListing[l.id] ?? []).map((doc) => (
                            <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-emerald-100">{doc.fileName}</p>
                                <p className="text-xs text-white/60">
                                  {formatDate(doc.createdAt)}
                                  {doc.signatureStatus ? ` · Signature: ${doc.signatureStatus}` : ""}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-wrap gap-2">
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-emerald-400/45 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/25"
                                >
                                  Open
                                </a>
                                {doc.signatureStatus !== "REQUESTED" && doc.signatureStatus !== "SIGNED" ? (
                                  <button
                                    type="button"
                                    disabled={previewMode}
                                    onClick={() => {
                                      void requestSignature(l.id, doc.id);
                                    }}
                                    className="rounded-full border border-cyan-300/55 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/25 disabled:opacity-50"
                                  >
                                    Request signature
                                  </button>
                                ) : null}
                                {doc.signatureStatus === "REQUESTED" ? (
                                  <button
                                    type="button"
                                    disabled={previewMode}
                                    onClick={() => {
                                      void markSigned(l.id, doc.id);
                                    }}
                                    className="rounded-full border border-amber-300/55 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:bg-amber-400/25 disabled:opacity-50"
                                  >
                                    Mark signed
                                  </button>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                      <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100/90">Offers from buyers</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <input id={`offer-buyerName-${l.id}`} placeholder="Buyer name" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                          <input id={`offer-amount-${l.id}`} type="number" placeholder="Offer amount" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                          <input id={`offer-buyerEmail-${l.id}`} placeholder="Buyer email (optional)" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                          <input id={`offer-buyerPhone-${l.id}`} placeholder="Buyer phone (optional)" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                        </div>
                        <textarea id={`offer-message-${l.id}`} rows={2} placeholder="Offer notes (optional)" className="mt-2 w-full rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                        <button
                          type="button"
                          disabled={savingOfferId === l.id}
                          onClick={() => {
                            void submitOffer(l.id);
                          }}
                          className="mt-3 rounded-full border border-indigo-300/70 bg-indigo-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 disabled:opacity-50"
                        >
                          {savingOfferId === l.id ? "Saving..." : "Add offer"}
                        </button>
                        {loadingOffersId === l.id ? <p className="mt-2 text-xs text-white/65">Loading offers...</p> : null}
                        <ul className="mt-3 space-y-2">
                          {(offersByListing[l.id] ?? []).map((offer) => (
                            <li key={offer.id} className="rounded-lg border border-white/10 bg-black/25 p-2 text-xs text-white/80">
                              <p className="font-semibold text-indigo-100">{offer.buyerName} - {formatMoney(offer.amount)}</p>
                              <p className="text-white/60">{offer.status} · {formatDate(offer.createdAt)}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {["REVIEWING", "COUNTERED", "ACCEPTED", "DECLINED"].map((next) => (
                                  <button
                                    key={next}
                                    type="button"
                                    onClick={() => {
                                      void updateOfferStatus(l.id, offer.id, next);
                                    }}
                                    className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/80"
                                  >
                                    {next}
                                  </button>
                                ))}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100/90">Upgrade requests</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <select id={`upgrade-slug-${l.id}`} className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50 sm:col-span-2">
                            {staticWizardUpgrades.map((u) => (
                              <option key={u.slug} value={u.slug}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                          <input id={`upgrade-amount-${l.id}`} type="number" defaultValue={99} className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                          <input id={`upgrade-note-${l.id}`} placeholder="Reconciliation note" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                        </div>
                        <button
                          type="button"
                          disabled={savingUpgradeId === l.id}
                          onClick={() => {
                            void submitUpgradeRequest(l.id);
                          }}
                          className="mt-3 rounded-full border border-indigo-300/70 bg-indigo-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 disabled:opacity-50"
                        >
                          {savingUpgradeId === l.id ? "Submitting..." : "Submit upgrade request"}
                        </button>
                        {loadingUpgradesId === l.id ? <p className="mt-2 text-xs text-white/65">Loading requests...</p> : null}
                        <ul className="mt-3 space-y-2">
                          {(upgradesByListing[l.id] ?? []).map((request) => (
                            <li key={request.id} className="rounded-lg border border-white/10 bg-black/25 p-2 text-xs text-white/80">
                              <p className="font-semibold text-indigo-100">{request.upgradeName} - {formatMoney(request.amount)}</p>
                              <p className="text-white/60">{request.status} · {formatDate(request.createdAt)}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {["IN_REVIEW", "APPROVED", "FULFILLED", "DECLINED"].map((next) => (
                                  <button
                                    key={next}
                                    type="button"
                                    onClick={() => {
                                      void updateUpgradeStatus(l.id, request.id, next);
                                    }}
                                    className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/80"
                                  >
                                    {next}
                                  </button>
                                ))}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6 rounded-xl border border-indigo-400/20 bg-indigo-950/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100/90">Open houses</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <input id={`openhouse-title-${l.id}`} placeholder="Open house title" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50 lg:col-span-2" />
                        <input id={`openhouse-start-${l.id}`} type="datetime-local" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                        <input id={`openhouse-end-${l.id}`} type="datetime-local" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50" />
                        <input id={`openhouse-notes-${l.id}`} placeholder="Notes (optional)" className="rounded-lg border border-indigo-400/30 bg-black/30 px-3 py-2 text-sm text-indigo-50 lg:col-span-4" />
                      </div>
                      <button
                        type="button"
                        disabled={savingOpenHouseId === l.id}
                        onClick={() => {
                          void scheduleOpenHouse(l.id);
                        }}
                        className="mt-3 rounded-full border border-indigo-300/70 bg-indigo-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 disabled:opacity-50"
                      >
                        {savingOpenHouseId === l.id ? "Scheduling..." : "Schedule open house"}
                      </button>
                      {loadingOpenHousesId === l.id ? <p className="mt-2 text-xs text-white/65">Loading open houses...</p> : null}
                      <ul className="mt-3 space-y-2">
                        {(openHousesByListing[l.id] ?? []).map((item) => (
                          <li key={item.id} className="rounded-lg border border-white/10 bg-black/25 p-2 text-xs text-white/80">
                            <p className="font-semibold text-indigo-100">{item.title}</p>
                            <p className="text-white/60">
                              {new Date(item.startAt).toLocaleString()} - {new Date(item.endAt).toLocaleString()}
                            </p>
                            <p className="text-white/60">{item.status}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {["SCHEDULED", "COMPLETED", "CANCELLED"].map((next) => (
                                <button
                                  key={next}
                                  type="button"
                                  onClick={() => {
                                    void updateOpenHouseStatus(l.id, item.id, next);
                                  }}
                                  className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/80"
                                >
                                  {next}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  void deleteOpenHouse(l.id, item.id);
                                }}
                                className="rounded-full border border-rose-300/35 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold text-rose-100"
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 rounded-xl border border-indigo-400/20 bg-indigo-950/20 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-100/90">
                        MLS export
                      </p>
                      <div className="mt-2">
                        {mlsJobByListing[l.id] ? (
                          <>
                            <p className="text-sm text-white/80">
                              Status: {mlsJobByListing[l.id]?.status} ({mlsJobByListing[l.id]?.progress}%)
                            </p>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/35">
                              <div
                                className="h-full rounded-full bg-indigo-400/80"
                                style={{ width: `${mlsJobByListing[l.id]?.progress ?? 0}%` }}
                              />
                            </div>
                            {mlsJobByListing[l.id]?.status === "COMPLETED" && mlsJobByListing[l.id]?.id ? (
                              <a
                                href={`/api/dashboard/listings/${l.id}/mls-export/${mlsJobByListing[l.id]?.id}/download`}
                                className="mt-3 inline-flex rounded-full border border-indigo-300/70 bg-indigo-500/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-100"
                              >
                                Download export file
                              </a>
                            ) : null}
                          </>
                        ) : (
                          <p className="text-sm text-white/65">No export generated yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={previewMode || savingId === l.id}
                        onClick={() => {
                          const desc = (document.getElementById(`desc-${l.id}`) as HTMLTextAreaElement).value;
                          const street = (document.getElementById(`street-${l.id}`) as HTMLInputElement).value;
                          const city = (document.getElementById(`city-${l.id}`) as HTMLInputElement).value;
                          const state = (document.getElementById(`state-${l.id}`) as HTMLInputElement).value;
                          const zip = (document.getElementById(`zip-${l.id}`) as HTMLInputElement).value;
                          const county = (document.getElementById(`county-${l.id}`) as HTMLInputElement).value;
                          const legalLot = (document.getElementById(`legalLot-${l.id}`) as HTMLInputElement).value;
                          const legalBlock = (document.getElementById(`legalBlock-${l.id}`) as HTMLInputElement).value;
                          const legalAddition = (document.getElementById(`legalAddition-${l.id}`) as HTMLInputElement).value;
                          const parcelId = (document.getElementById(`parcelId-${l.id}`) as HTMLInputElement).value;
                          const propertyType = (document.getElementById(`propertyType-${l.id}`) as HTMLSelectElement).value;
                          const sellerNames = (document.getElementById(`sellerNames-${l.id}`) as HTMLInputElement).value;
                          const contactPhone = (document.getElementById(`contactPhone-${l.id}`) as HTMLInputElement).value;
                          const contactEmail = (document.getElementById(`contactEmail-${l.id}`) as HTMLInputElement).value;
                          const feeSimpleConfirmed = (document.getElementById(`feeSimple-${l.id}`) as HTMLInputElement).checked;
                          const tenantOccupied = (document.getElementById(`tenantOccupied-${l.id}`) as HTMLInputElement).checked;
                          const namedSubdivision =
                            (document.getElementById(`namedSubdivision-${l.id}`) as HTMLInputElement).checked;
                          const subdivisionName = (document.getElementById(`subdivisionName-${l.id}`) as HTMLInputElement).value;
                          const associationType =
                            (document.getElementById(`associationType-${l.id}`) as HTMLSelectElement).value;
                          const newConstruction =
                            (document.getElementById(`newConstruction-${l.id}`) as HTMLInputElement).checked;
                          const septicSystem = (document.getElementById(`septicSystem-${l.id}`) as HTMLInputElement).checked;
                          const hasPool = (document.getElementById(`hasPool-${l.id}`) as HTMLInputElement).checked;
                          const lockboxOrKeypad =
                            (document.getElementById(`lockboxOrKeypad-${l.id}`) as HTMLInputElement).checked;
                          const lockboxInstructions =
                            (document.getElementById(`lockboxInstructions-${l.id}`) as HTMLInputElement).value;
                          const ownershipType =
                            (document.getElementById(`ownershipType-${l.id}`) as HTMLSelectElement).value;
                          const allOwnersOccupyProperty =
                            (document.getElementById(`allOwnersOccupy-${l.id}`) as HTMLInputElement).checked;
                          const businessEntityName =
                            (document.getElementById(`businessEntityName-${l.id}`) as HTMLInputElement).value;
                          const businessEntityRegisteredName =
                            (document.getElementById(`businessEntityRegisteredName-${l.id}`) as HTMLInputElement).value;
                          const businessEntitySignerName =
                            (document.getElementById(`businessEntitySignerName-${l.id}`) as HTMLInputElement).value;
                          const businessEntitySignerTitle =
                            (document.getElementById(`businessEntitySignerTitle-${l.id}`) as HTMLInputElement).value;
                          const businessEntitySignerEmail =
                            (document.getElementById(`businessEntitySignerEmail-${l.id}`) as HTMLInputElement).value;
                          const allOwnersConsentEsign =
                            (document.getElementById(`allOwnersConsentEsign-${l.id}`) as HTMLInputElement).checked;
                          const appointmentPhone =
                            (document.getElementById(`appointmentPhone-${l.id}`) as HTMLInputElement).value;
                          const appointmentPhoneCanText =
                            (document.getElementById(`appointmentPhoneCanText-${l.id}`) as HTMLInputElement).checked;
                          const alternatePhone =
                            (document.getElementById(`alternatePhone-${l.id}`) as HTMLInputElement).value;
                          const alternatePhoneCanText =
                            (document.getElementById(`alternatePhoneCanText-${l.id}`) as HTMLInputElement).checked;
                          const appointmentEmail =
                            (document.getElementById(`appointmentEmail-${l.id}`) as HTMLInputElement).value;
                          const price = Number((document.getElementById(`price-${l.id}`) as HTMLInputElement).value);
                          const flatFeeRaw = (document.getElementById(`flatFee-${l.id}`) as HTMLInputElement).value;
                          const protectionDaysRaw = (document.getElementById(`protectionDays-${l.id}`) as HTMLInputElement).value;
                          const listingStartOnRaw = (document.getElementById(`listingStartOn-${l.id}`) as HTMLInputElement).value;
                          const listingEndOnRaw = (document.getElementById(`listingEndOn-${l.id}`) as HTMLInputElement).value;
                          const intermediaryStatusAuthorized =
                            (document.getElementById(`intermediary-${l.id}`) as HTMLInputElement).checked;
                          const buyerAgentCompType =
                            (document.getElementById(`buyerCompType-${l.id}`) as HTMLSelectElement).value;
                          const bacRaw = (document.getElementById(`bac-${l.id}`) as HTMLInputElement).value;
                          const buyerCompAmountRaw =
                            (document.getElementById(`buyerCompAmount-${l.id}`) as HTMLInputElement).value;
                          const status = (document.getElementById(`status-${l.id}`) as HTMLSelectElement).value;
                          const exclusions = (document.getElementById(`exclusions-${l.id}`) as HTMLTextAreaElement).value;
                          const improvementsAndAccessories =
                            (document.getElementById(`improvements-${l.id}`) as HTMLTextAreaElement).value;
                          const publicRemarks = (document.getElementById(`publicRemarks-${l.id}`) as HTMLTextAreaElement).value;
                          const privateRemarks = (document.getElementById(`privateRemarks-${l.id}`) as HTMLTextAreaElement).value;
                          const drivingDirections =
                            (document.getElementById(`drivingDirections-${l.id}`) as HTMLTextAreaElement).value;
                          const schedulingService =
                            (document.getElementById(`schedulingService-${l.id}`) as HTMLInputElement).value;
                          const crossStreet = (document.getElementById(`crossStreet-${l.id}`) as HTMLInputElement).value;
                          const hoaRequired = (document.getElementById(`hoaRequired-${l.id}`) as HTMLInputElement).checked;
                          const keyboxPermission =
                            (document.getElementById(`keyboxPermission-${l.id}`) as HTMLInputElement).checked;
                          const keyboxRiskAcknowledged =
                            (document.getElementById(`keyboxRisk-${l.id}`) as HTMLInputElement).checked;
                          const firstPhotoExteriorConfirmed =
                            (document.getElementById(`photoExterior-${l.id}`) as HTMLInputElement).checked;
                          const photoNoSignsConfirmed =
                            (document.getElementById(`photoNoSigns-${l.id}`) as HTMLInputElement).checked;
                          const photoNoPeoplePetsConfirmed =
                            (document.getElementById(`photoNoPeoplePets-${l.id}`) as HTMLInputElement).checked;
                          const photoCopyrightConfirmed =
                            (document.getElementById(`photoCopyright-${l.id}`) as HTMLInputElement).checked;
                          const yearBuiltRaw = (document.getElementById(`yearBuilt-${l.id}`) as HTMLInputElement).value;
                          const isInMudWaterDistrict =
                            (document.getElementById(`mudDistrict-${l.id}`) as HTMLInputElement).checked;
                          const fairHousingNoticeConfirmed =
                            (document.getElementById(`fairHousing-${l.id}`) as HTMLInputElement).checked;
                          const valuablesNoticeConfirmed =
                            (document.getElementById(`valuables-${l.id}`) as HTMLInputElement).checked;
                          const iabsAcknowledged =
                            (document.getElementById(`iabsAck-${l.id}`) as HTMLInputElement).checked;
                          const sellersDisclosureAcknowledged =
                            (document.getElementById(`sellerDisclosureAck-${l.id}`) as HTMLInputElement).checked;
                          const listingAgreementAcknowledged =
                            (document.getElementById(`listingAgreementAck-${l.id}`) as HTMLInputElement).checked;
                          const brokerBrandingConfirmed =
                            (document.getElementById(`brandingAck-${l.id}`) as HTMLInputElement).checked;
                          const informationAccurateConfirmed =
                            (document.getElementById(`infoAccurate-${l.id}`) as HTMLInputElement).checked;
                          const referredByExistingCustomer =
                            (document.getElementById(`referredByExisting-${l.id}`) as HTMLInputElement).checked;
                          const wantsListingProcessFeedback =
                            (document.getElementById(`wantsFeedback-${l.id}`) as HTMLInputElement).checked;
                          const buyerAgentCompPct =
                            bacRaw === "" ? null : Number.parseFloat(bacRaw);
                          void patchListing(l.id, {
                            street,
                            city,
                            state,
                            zip,
                            county,
                            legalLot,
                            legalBlock,
                            legalAddition,
                            parcelId,
                            propertyType,
                            sellerNames,
                            contactPhone,
                            contactEmail,
                            feeSimpleConfirmed,
                            tenantOccupied,
                            namedSubdivision,
                            subdivisionName,
                            associationType,
                            newConstruction,
                            septicSystem,
                            hasPool,
                            lockboxOrKeypad,
                            lockboxInstructions,
                            ownershipType,
                            allOwnersOccupyProperty,
                            businessEntityName,
                            businessEntityRegisteredName,
                            businessEntitySignerName,
                            businessEntitySignerTitle,
                            businessEntitySignerEmail,
                            allOwnersConsentEsign,
                            appointmentPhone,
                            appointmentPhoneCanText,
                            alternatePhone,
                            alternatePhoneCanText,
                            appointmentEmail,
                            description: desc,
                            price,
                            flatFee: flatFeeRaw === "" ? null : Number(flatFeeRaw),
                            protectionPeriodDays: protectionDaysRaw === "" ? null : Number(protectionDaysRaw),
                            listingStartOn: listingStartOnRaw ? new Date(listingStartOnRaw).toISOString() : null,
                            listingEndOn: listingEndOnRaw ? new Date(listingEndOnRaw).toISOString() : null,
                            intermediaryStatusAuthorized,
                            buyerAgentCompType,
                            buyerAgentCompPct: Number.isFinite(buyerAgentCompPct as number)
                              ? buyerAgentCompPct
                              : null,
                            buyerAgentCompAmount: buyerCompAmountRaw === "" ? null : Number(buyerCompAmountRaw),
                            status,
                            exclusions,
                            improvementsAndAccessories,
                            publicRemarks,
                            privateRemarks,
                            drivingDirections,
                            schedulingService,
                            crossStreet,
                            hoaRequired,
                            keyboxPermission,
                            keyboxRiskAcknowledged,
                            firstPhotoExteriorConfirmed,
                            photoNoSignsConfirmed,
                            photoNoPeoplePetsConfirmed,
                            photoCopyrightConfirmed,
                            yearBuilt: yearBuiltRaw === "" ? null : Number(yearBuiltRaw),
                            isInMudWaterDistrict,
                            fairHousingNoticeConfirmed,
                            valuablesNoticeConfirmed,
                            iabsAcknowledged,
                            sellersDisclosureAcknowledged,
                            listingAgreementAcknowledged,
                            brokerBrandingConfirmed,
                            informationAccurateConfirmed,
                            referredByExistingCustomer,
                            wantsListingProcessFeedback,
                          });
                        }}
                        className="rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-50"
                      >
                        {previewMode
                          ? "Preview only"
                          : uploadingId === l.id
                            ? "Uploading image…"
                            : savingId === l.id
                              ? "Saving…"
                              : "Save changes"}
                      </button>
                      <span className="self-center text-xs text-white/60">
                        Document upload, open houses, and MLS download can plug into the same listing record next.
                      </span>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <section className="rounded-2xl border border-emerald-500/25 bg-black/45 p-5 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
        <h2 className="text-lg font-semibold text-emerald-100">FAQs</h2>
        <details className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">
          <summary className="cursor-pointer font-semibold">Why is my listing still showing as INCOMPLETE?</summary>
          <p className="mt-2 text-white/70">
            Brokerage compliance checks, required disclosures, and MLS data entry must finish before status moves to
            ACTIVE. Use this dashboard to keep price, description, and compensation current while your coordinator
            completes setup.
          </p>
        </details>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/65">{label}</p>
      <p className="mt-1 text-sm text-emerald-100">{value || "—"}</p>
    </div>
  );
}
