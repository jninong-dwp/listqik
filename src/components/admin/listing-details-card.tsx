import type { ReactNode } from "react";
import { LISTING_PLATFORM_OPTIONS } from "@/lib/listing-platforms";

type ListingDoc = Record<string, unknown> & {
  _id: unknown;
  street?: string;
  unit?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  legalLot?: string;
  legalBlock?: string;
  legalAddition?: string;
  legalDescription?: string;
  propertyType?: string;
  parcelId?: string;
  sellerNames?: string;
  contactPhone?: string;
  contactEmail?: string;
  feeSimpleConfirmed?: boolean;
  tenantOccupied?: boolean;
  namedSubdivision?: boolean;
  subdivisionName?: string;
  associationType?: string;
  newConstruction?: boolean;
  septicSystem?: boolean;
  hasSolarSystem?: boolean;
  hasPool?: boolean;
  lockboxOrKeypad?: boolean;
  lockboxInstructions?: string;
  ownershipType?: string;
  allSignersUsCitizens?: boolean;
  anyOwnerLicensedAgent?: boolean;
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
  listingStartOn?: Date | string | null;
  listingEndOn?: Date | string | null;
  flatFee?: number | null;
  protectionPeriodDays?: number | null;
  intermediaryStatusAuthorized?: boolean;
  buyerAgentCompType?: string;
  buyerAgentCompAmount?: number | null;
  buyerAgentCompPct?: number | null;
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
  mlsName?: string;
  mlsNumber?: string;
  listingId?: string;
  listingPlatforms?: string[];
  additionalPhotoUrls?: string[];
  status?: string;
  planLabel?: string;
  price?: number;
  description?: string;
  heroImageUrl?: string;
  sourceOrderId?: string;
  orderedOn?: Date | string | null;
  listedOn?: Date | string | null;
  expiresOn?: Date | string | null;
  setupFinalizedAt?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type ListingDocument = Record<string, unknown> & {
  _id: unknown;
  fileName?: string;
  documentType?: string;
  fileUrl?: string;
};

type UpgradeRequest = Record<string, unknown> & {
  _id: unknown;
  upgradeName?: string;
  slug?: string;
  status?: string;
};

type Props = {
  listing: ListingDoc;
  documents: ListingDocument[];
  upgradeRequests: UpgradeRequest[];
};

const DASH = "—";

function fmtDate(value: Date | string | null | undefined): string {
  if (!value) return DASH;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDay(value: Date | string | null | undefined): string {
  if (!value) return DASH;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

function fmtMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return DASH;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return DASH;
  return String(value);
}

function fmtText(value: string | null | undefined): string {
  if (!value) return DASH;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : DASH;
}

function fmtBool(value: boolean | undefined): string {
  return value ? "Yes" : "No";
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  SINGLE_FAMILY: "Single family",
  CONDOMINIUM: "Condominium",
};

const ASSOCIATION_LABELS: Record<string, string> = {
  HOA: "HOA",
  CONDO: "Condo association",
  NONE: "None",
};

const OWNERSHIP_LABELS: Record<string, string> = {
  INDIVIDUAL: "Individual",
  MARRIED_COUPLE: "Married couple",
  DECEASED_ESTATE: "Deceased estate",
  BUSINESS_ENTITY: "Business entity",
  POWER_OF_ATTORNEY: "Power of attorney",
};

const STATUS_LABELS: Record<string, string> = {
  INCOMPLETE: "Incomplete",
  ACTIVE: "Active",
  PENDING: "Pending",
  EXPIRED: "Expired",
  SOLD: "Sold",
};

const STATUS_TONE: Record<string, string> = {
  INCOMPLETE: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  ACTIVE: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  PENDING: "border-sky-400/40 bg-sky-500/10 text-sky-200",
  EXPIRED: "border-rose-400/40 bg-rose-500/10 text-rose-200",
  SOLD: "border-violet-400/40 bg-violet-500/10 text-violet-200",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <h5 className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
        {title}
      </h5>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-white/55">{label}</p>
      <div className="mt-1 break-words text-sm text-white/90">{value}</div>
    </div>
  );
}

function FullRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-white/55">{label}</p>
      <div className="mt-1 whitespace-pre-wrap break-words text-sm text-white/90">{value}</div>
    </div>
  );
}

function CheckRow({ label, value }: { label: string; value: boolean | undefined }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
          value
            ? "bg-emerald-500/20 text-emerald-200"
            : "bg-white/10 text-white/40"
        }`}
        aria-hidden
      >
        {value ? "✓" : "·"}
      </span>
      <span className="text-sm text-white/90">{label}</span>
    </div>
  );
}

export function AdminListingDetailsCard({ listing, documents, upgradeRequests }: Props) {
  const platformLabelById = new Map<string, string>(
    LISTING_PLATFORM_OPTIONS.map((p) => [p.id, p.label] as [string, string]),
  );
  const platformLabels = (listing.listingPlatforms ?? [])
    .map((id) => platformLabelById.get(id) ?? id)
    .join(", ");

  const gallery = (listing.additionalPhotoUrls ?? []).filter(
    (url): url is string => typeof url === "string" && url.trim().length > 0,
  );

  const fullAddress = [
    listing.street,
    listing.unit ? `#${listing.unit}` : "",
    listing.city,
    [listing.state, listing.zip].filter(Boolean).join(" "),
  ]
    .filter((part) => part && part.trim().length > 0)
    .join(", ");

  const statusKey = listing.status ?? "INCOMPLETE";
  const statusLabel = STATUS_LABELS[statusKey] ?? statusKey;
  const statusTone = STATUS_TONE[statusKey] ?? "border-white/20 bg-white/10 text-white/80";

  const buyerCompDisplay =
    listing.buyerAgentCompType === "AMOUNT"
      ? fmtMoney(listing.buyerAgentCompAmount ?? null)
      : listing.buyerAgentCompPct !== null && listing.buyerAgentCompPct !== undefined
        ? `${listing.buyerAgentCompPct}%`
        : DASH;

  return (
    <article className="space-y-4 rounded-2xl border border-white/15 bg-black/30 p-4 text-sm text-white/90">
      <header className="space-y-2 border-b border-white/10 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-emerald-100">
              {fmtText(fullAddress)}
            </p>
            <p className="mt-1 text-xs text-white/55">
              Created {fmtDate(listing.createdAt)} · Updated {fmtDate(listing.updatedAt)}
              {listing.setupFinalizedAt ? ` · Finalized ${fmtDate(listing.setupFinalizedAt)}` : ""}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone}`}
          >
            {statusLabel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/70 sm:grid-cols-4">
          <div>
            <p className="text-white/45">Plan</p>
            <p className="text-white/90">{fmtText(listing.planLabel)}</p>
          </div>
          <div>
            <p className="text-white/45">List price</p>
            <p className="text-white/90">{fmtMoney(listing.price ?? null)}</p>
          </div>
          <div>
            <p className="text-white/45">Buyer agent comp</p>
            <p className="text-white/90">{buyerCompDisplay}</p>
          </div>
          <div>
            <p className="text-white/45">Source order</p>
            <p className="break-all text-white/90">{fmtText(listing.sourceOrderId)}</p>
          </div>
        </div>
      </header>

      <Section title="Step 1 — Photos & hero image">
        <FullRow
          label="Hero image"
          value={
            listing.heroImageUrl ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- proxy/external URL, no Image optimizer */}
                <img
                  src={listing.heroImageUrl}
                  alt="Hero"
                  className="block max-h-72 w-full rounded-lg border border-white/10 object-cover"
                />
                <a
                  className="break-all text-xs text-emerald-300 underline"
                  href={listing.heroImageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {listing.heroImageUrl}
                </a>
              </div>
            ) : (
              <span className="text-white/55">Not uploaded</span>
            )
          }
        />
        <FullRow
          label={`Additional photos (${gallery.length})`}
          value={
            gallery.length === 0 ? (
              <span className="text-white/55">None uploaded</span>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {gallery.map((url, idx) => (
                    <a
                      key={`${url}-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-lg border border-white/10 bg-black/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- proxy/external URL, no Image optimizer */}
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="block aspect-square w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
                <details className="text-xs text-white/60">
                  <summary className="cursor-pointer text-emerald-300/80 hover:text-emerald-200">
                    Show photo URLs
                  </summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {gallery.map((url, idx) => (
                      <li key={`url-${idx}`} className="break-all">
                        <a className="text-emerald-300 underline" href={url} target="_blank" rel="noreferrer">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )
          }
        />
        <CheckRow label="First photo is exterior" value={listing.firstPhotoExteriorConfirmed} />
        <CheckRow label="No signs in photos" value={listing.photoNoSignsConfirmed} />
        <CheckRow label="No people / pets in photos" value={listing.photoNoPeoplePetsConfirmed} />
        <CheckRow label="Photo copyright confirmed" value={listing.photoCopyrightConfirmed} />
      </Section>

      <Section title="Property & legal">
        <Row label="Street" value={fmtText(listing.street)} />
        <Row label="Unit" value={fmtText(listing.unit)} />
        <Row label="City" value={fmtText(listing.city)} />
        <Row label="State" value={fmtText(listing.state)} />
        <Row label="ZIP" value={fmtText(listing.zip)} />
        <Row label="County" value={fmtText(listing.county)} />
        <Row label="Property type" value={PROPERTY_TYPE_LABELS[listing.propertyType ?? ""] ?? fmtText(listing.propertyType)} />
        <Row label="Year built" value={fmtNumber(listing.yearBuilt ?? null)} />
        <Row label="Parcel / Tax ID" value={fmtText(listing.parcelId)} />
        <Row label="Legal lot" value={fmtText(listing.legalLot)} />
        <Row label="Legal block" value={fmtText(listing.legalBlock)} />
        <Row label="Legal addition" value={fmtText(listing.legalAddition)} />
        <FullRow label="Full legal description" value={fmtText(listing.legalDescription)} />
        <Row label="Subdivision named" value={fmtBool(listing.namedSubdivision)} />
        <Row label="Subdivision name" value={fmtText(listing.subdivisionName)} />
        <Row label="Association" value={ASSOCIATION_LABELS[listing.associationType ?? ""] ?? fmtText(listing.associationType)} />
        <Row label="HOA required" value={fmtBool(listing.hoaRequired)} />
        <Row label="New construction" value={fmtBool(listing.newConstruction)} />
        <Row label="Septic system" value={fmtBool(listing.septicSystem)} />
        <Row label="Solar system" value={fmtBool(listing.hasSolarSystem)} />
        <Row label="Has pool" value={fmtBool(listing.hasPool)} />
        <Row label="In MUD / water district" value={fmtBool(listing.isInMudWaterDistrict)} />
        <Row label="Fee simple confirmed" value={fmtBool(listing.feeSimpleConfirmed)} />
        <Row label="Tenant occupied" value={fmtBool(listing.tenantOccupied)} />
      </Section>

      <Section title="Ownership & sellers">
        <Row label="Ownership type" value={OWNERSHIP_LABELS[listing.ownershipType ?? ""] ?? fmtText(listing.ownershipType)} />
        <Row label="All signers US citizens" value={fmtBool(listing.allSignersUsCitizens)} />
        <Row label="Any owner licensed agent" value={fmtBool(listing.anyOwnerLicensedAgent)} />
        <Row label="All owners occupy property" value={fmtBool(listing.allOwnersOccupyProperty)} />
        <Row label="All owners consent to e-sign" value={fmtBool(listing.allOwnersConsentEsign)} />
        <FullRow label="Seller names" value={fmtText(listing.sellerNames)} />
        <Row label="Business entity name" value={fmtText(listing.businessEntityName)} />
        <Row label="Registered name" value={fmtText(listing.businessEntityRegisteredName)} />
        <Row label="Signer name" value={fmtText(listing.businessEntitySignerName)} />
        <Row label="Signer title" value={fmtText(listing.businessEntitySignerTitle)} />
        <Row label="Signer email" value={fmtText(listing.businessEntitySignerEmail)} />
      </Section>

      <Section title="Contact & scheduling">
        <Row label="Contact phone" value={fmtText(listing.contactPhone)} />
        <Row label="Contact email" value={fmtText(listing.contactEmail)} />
        <Row label="Appointment phone" value={fmtText(listing.appointmentPhone)} />
        <Row label="Appointment phone can text" value={fmtBool(listing.appointmentPhoneCanText)} />
        <Row label="Alternate phone" value={fmtText(listing.alternatePhone)} />
        <Row label="Alternate phone can text" value={fmtBool(listing.alternatePhoneCanText)} />
        <Row label="Appointment email" value={fmtText(listing.appointmentEmail)} />
        <Row label="Scheduling service" value={fmtText(listing.schedulingService)} />
        <Row label="Lockbox / keypad" value={fmtBool(listing.lockboxOrKeypad)} />
        <Row label="Keybox permission" value={fmtBool(listing.keyboxPermission)} />
        <Row label="Keybox risk acknowledged" value={fmtBool(listing.keyboxRiskAcknowledged)} />
        <FullRow label="Lockbox instructions" value={fmtText(listing.lockboxInstructions)} />
      </Section>

      <Section title="Pricing & compensation">
        <Row label="List price" value={fmtMoney(listing.price ?? null)} />
        <Row label="Flat fee" value={fmtMoney(listing.flatFee ?? null)} />
        <Row label="Protection period (days)" value={fmtNumber(listing.protectionPeriodDays ?? null)} />
        <Row
          label="Buyer agent comp type"
          value={listing.buyerAgentCompType === "AMOUNT" ? "Flat amount" : "Percent"}
        />
        <Row label="Buyer agent comp percent" value={listing.buyerAgentCompPct !== null && listing.buyerAgentCompPct !== undefined ? `${listing.buyerAgentCompPct}%` : DASH} />
        <Row label="Buyer agent comp amount" value={fmtMoney(listing.buyerAgentCompAmount ?? null)} />
        <Row label="Intermediary status authorized" value={fmtBool(listing.intermediaryStatusAuthorized)} />
      </Section>

      <Section title="Listing dates & lifecycle">
        <Row label="Ordered on" value={fmtDay(listing.orderedOn)} />
        <Row label="Listing starts" value={fmtDay(listing.listingStartOn)} />
        <Row label="Listing ends" value={fmtDay(listing.listingEndOn)} />
        <Row label="Listed on" value={fmtDay(listing.listedOn)} />
        <Row label="Expires on" value={fmtDay(listing.expiresOn)} />
        <Row label="Setup finalized" value={fmtDate(listing.setupFinalizedAt)} />
      </Section>

      <Section title="MLS & marketing platforms">
        <Row label="MLS name" value={fmtText(listing.mlsName)} />
        <Row label="MLS number" value={fmtText(listing.mlsNumber)} />
        <Row label="Listing ID" value={fmtText(listing.listingId)} />
        <FullRow label="Platforms requested" value={platformLabels.length > 0 ? platformLabels : DASH} />
      </Section>

      <Section title="Remarks & marketing copy">
        <FullRow label="Public remarks / description" value={fmtText(listing.publicRemarks || listing.description)} />
        <FullRow label="Private remarks" value={fmtText(listing.privateRemarks)} />
        <FullRow label="Driving directions" value={fmtText(listing.drivingDirections)} />
        <Row label="Cross street" value={fmtText(listing.crossStreet)} />
        <FullRow label="Exclusions" value={fmtText(listing.exclusions)} />
        <FullRow label="Improvements & accessories" value={fmtText(listing.improvementsAndAccessories)} />
      </Section>

      <Section title="Disclosures & acknowledgments">
        <CheckRow label="Fair housing notice" value={listing.fairHousingNoticeConfirmed} />
        <CheckRow label="Valuables notice" value={listing.valuablesNoticeConfirmed} />
        <CheckRow label="IABS acknowledged" value={listing.iabsAcknowledged} />
        <CheckRow label="Seller's disclosure" value={listing.sellersDisclosureAcknowledged} />
        <CheckRow label="Listing agreement" value={listing.listingAgreementAcknowledged} />
        <CheckRow label="Broker branding confirmed" value={listing.brokerBrandingConfirmed} />
        <CheckRow label="Information accurate" value={listing.informationAccurateConfirmed} />
        <CheckRow label="Referred by existing customer" value={listing.referredByExistingCustomer} />
        <CheckRow label="Wants listing process feedback" value={listing.wantsListingProcessFeedback} />
      </Section>

      <Section title={`Uploaded documents (${documents.length})`}>
        <FullRow
          label="Files"
          value={
            documents.length === 0 ? (
              <span className="text-white/55">No documents uploaded.</span>
            ) : (
              <ul className="space-y-1">
                {documents.map((doc) => (
                  <li key={String(doc._id)} className="flex flex-wrap items-center gap-2">
                    <span className="text-white/90">{fmtText(doc.fileName)}</span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
                      {fmtText(doc.documentType)}
                    </span>
                    {doc.fileUrl ? (
                      <a
                        className="text-xs text-emerald-300 underline"
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )
          }
        />
      </Section>

      <Section title={`Upgrade requests (${upgradeRequests.length})`}>
        <FullRow
          label="Requests"
          value={
            upgradeRequests.length === 0 ? (
              <span className="text-white/55">None requested.</span>
            ) : (
              <ul className="space-y-1">
                {upgradeRequests.map((req) => (
                  <li key={String(req._id)} className="flex flex-wrap items-center gap-2">
                    <span className="text-white/90">{fmtText(req.upgradeName)}</span>
                    <span className="text-white/55">({fmtText(req.slug)})</span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60">
                      {fmtText(req.status)}
                    </span>
                  </li>
                ))}
              </ul>
            )
          }
        />
      </Section>
    </article>
  );
}
