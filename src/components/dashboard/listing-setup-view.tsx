"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type ListingSetupData = {
  id: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  mlsName: string;
  mlsNumber: string;
  listingId: string;
  status: string;
  planLabel: string;
  price: number;
  buyerAgentCompPct: number | null;
  description: string;
  heroImageUrl: string;
  orderedOn: string | null;
  listedOn: string | null;
  expiresOn: string | null;
  setupFinalizedAt: string | null;
};

const previewSetupListings: ListingSetupData[] = [
  {
    id: "preview-listing-1",
    street: "1234 Lakeshore Dr",
    unit: "",
    city: "Austin",
    state: "TX",
    zip: "78704",
    county: "Travis",
    mlsName: "Austin Board of Realtors",
    mlsNumber: "ABR-1234567",
    listingId: "LISTQIK-1001",
    status: "INCOMPLETE",
    planLabel: "Gold Plan · 25 photos",
    price: 545000,
    buyerAgentCompPct: 2.5,
    description:
      "Beautifully updated single-story home with open kitchen, covered patio, and quick access to downtown Austin.",
    heroImageUrl: "",
    orderedOn: "2026-04-12T08:00:00.000Z",
    listedOn: null,
    expiresOn: null,
    setupFinalizedAt: null,
  },
  {
    id: "preview-listing-2",
    street: "8702 Meadow Park Ln",
    unit: "",
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
    description:
      "Move-in ready two-story with upgraded kitchen, large backyard, and convenient freeway access.",
    heroImageUrl: "",
    orderedOn: "2026-03-22T08:00:00.000Z",
    listedOn: "2026-03-30T08:00:00.000Z",
    expiresOn: "2026-09-30T08:00:00.000Z",
    setupFinalizedAt: "2026-03-29T08:00:00.000Z",
  },
  {
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
    description:
      "Updated condo with modern finishes, private patio, and quick access to major shopping and dining areas.",
    heroImageUrl: "",
    orderedOn: "2026-02-10T08:00:00.000Z",
    listedOn: "2026-02-20T08:00:00.000Z",
    expiresOn: "2026-08-20T08:00:00.000Z",
    setupFinalizedAt: "2026-02-19T08:00:00.000Z",
  },
];

type SetupStep = {
  id: string;
  title: string;
  subtitle: string;
  complete: boolean;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Pending";
  }
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
          | { ok?: boolean; listing?: ListingSetupData; error?: string }
          | null;
        if (!res.ok || !data?.ok || !data.listing) {
          if (res.status === 401) {
            throw new Error("Please sign in to load this listing setup.");
          }
          throw new Error(data?.error || "Could not load listing setup.");
        }
        if (!cancelled) {
          setListing(data.listing);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setListing(null);
        setError(err instanceof Error ? err.message : "Could not load listing setup.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
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
        subtitle: "Address and base record integrity",
        complete: Boolean(listing.street && listing.city && listing.state && listing.zip),
      },
      {
        id: "contact-ownership",
        title: "Contact and ownership",
        subtitle: "Account, county, and listing ownership context",
        complete: Boolean(listing.county),
      },
      {
        id: "price-compensation",
        title: "Price and compensation",
        subtitle: "List price and buyer-agent compensation",
        complete: listing.price > 0 && listing.buyerAgentCompPct !== null,
      },
      {
        id: "property-description",
        title: "Property description",
        subtitle: "Public remarks and compliance-safe messaging",
        complete: listing.description.trim().length >= 40,
      },
      {
        id: "photos-media",
        title: "Photos and media",
        subtitle: "Hero image and media readiness",
        complete: Boolean(listing.heroImageUrl),
      },
      {
        id: "mls-profile",
        title: "MLS details",
        subtitle: "MLS source and listing identifiers",
        complete: Boolean(listing.mlsName || listing.mlsNumber || listing.listingId),
      },
      {
        id: "complete-listing-setup",
        title: "Complete listing setup",
        subtitle: "Operational status and publish readiness",
        complete: listing.status !== "INCOMPLETE",
      },
    ];
  }, [listing]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = window.localStorage.getItem("listing-photo-disclaimer-accepted") === "true";
    setPhotoDisclaimerAccepted(accepted);
  }, []);

  function handleStepNavClick(stepId: string, event: React.MouseEvent<HTMLAnchorElement>) {
    if (stepId !== "photos-media" || photoDisclaimerAccepted) {
      return;
    }
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
      const target = document.getElementById(pendingAnchor);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
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
      steps.find((s) => s.id === "mls-profile")?.complete,
  );
  const prevStep = activeStepIndex > 0 ? steps[activeStepIndex - 1] : null;
  const nextStep = activeStepIndex < steps.length - 1 ? steps[activeStepIndex + 1] : null;

  const missingByStep = useMemo<Record<string, string[]>>(() => {
    if (!listing) return {};
    return {
      "general-information": [
        ...(!listing.street ? ["Street"] : []),
        ...(!listing.city ? ["City"] : []),
        ...(!listing.state ? ["State"] : []),
        ...(!listing.zip ? ["ZIP"] : []),
      ],
      "contact-ownership": [...(!listing.county ? ["County"] : [])],
      "price-compensation": [
        ...(listing.price <= 0 ? ["Valid list price"] : []),
        ...(listing.buyerAgentCompPct === null ? ["Buyer agent compensation %"] : []),
      ],
      "property-description": [...(listing.description.trim().length < 40 ? ["Description (40+ characters)"] : [])],
      "photos-media": [...(!listing.heroImageUrl ? ["Hero image"] : [])],
      "mls-profile": [
        ...(!(listing.mlsName || listing.mlsNumber || listing.listingId) ? ["MLS name, number, or listing ID"] : []),
      ],
      "complete-listing-setup": [
        ...(listing.status === "INCOMPLETE" ? ["Set listing status to ACTIVE/PENDING/etc."] : []),
      ],
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
    try {
      const res = await fetch(`/api/dashboard/listings/${listingId}/finalize`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; validationErrors?: string[] }
        | null;
      if (!res.ok || !data?.ok) {
        setFinalizeError(data?.error ?? "Could not finalize listing setup.");
        setFinalizeDetails(data?.validationErrors ?? []);
        return;
      }

      const refreshed = await fetch(`/api/dashboard/listings/${listingId}`, { cache: "no-store" });
      const refreshedData = (await refreshed.json().catch(() => null)) as
        | { ok?: boolean; listing?: ListingSetupData }
        | null;
      if (refreshed.ok && refreshedData?.ok && refreshedData.listing) {
        setListing(refreshedData.listing);
      }
    } catch {
      setFinalizeError("Network error while finalizing setup.");
    } finally {
      setFinalizing(false);
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

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-emerald-500/25 bg-black/55 p-4">
        <div className="rounded-xl border border-emerald-400/35 bg-emerald-950/35 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/80">Setup Progress</p>
          <p className="mt-1 text-lg font-semibold text-emerald-100">{completionPct}% complete</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
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
                  onClick={(event) => {
                    handleStepNavClick(step.id, event);
                  }}
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Listing Setup Detail
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-emerald-50">General Information (Read-only)</h1>
          <p className="mt-2 text-sm text-white/70">
            This page reflects your current listing setup state. Edits happen on the dashboard listing editor, and
            finalization can be completed here once all required sections are ready.
          </p>
        </header>
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

        <div className="mt-5 grid gap-5">
          <InfoCard
            id="general-information"
            title="1. General information"
            complete={steps.find((s) => s.id === "general-information")?.complete ?? false}
            missingItems={missingByStep["general-information"] ?? []}
          >
            <InfoGrid
              items={[
                ["Street", listing.street || "Pending"],
                ["Unit", listing.unit || "N/A"],
                ["City", listing.city || "Pending"],
                ["State", listing.state || "Pending"],
                ["ZIP", listing.zip || "Pending"],
                ["County", listing.county || "Pending"],
              ]}
            />
          </InfoCard>

          <InfoCard
            id="contact-ownership"
            title="2. Contact / ownership"
            complete={steps.find((s) => s.id === "contact-ownership")?.complete ?? false}
            missingItems={missingByStep["contact-ownership"] ?? []}
          >
            <InfoGrid
              items={[
                ["Owner account", "Linked to your dashboard account"],
                ["Plan", listing.planLabel || "Plan attached at purchase"],
                ["Status", listing.status],
                ["County", listing.county || "Pending"],
                ["Ordered on", formatDate(listing.orderedOn)],
              ]}
            />
          </InfoCard>

          <InfoCard
            id="price-compensation"
            title="3. Price & compensation"
            complete={steps.find((s) => s.id === "price-compensation")?.complete ?? false}
            missingItems={missingByStep["price-compensation"] ?? []}
          >
            <InfoGrid
              items={[
                ["List price", formatMoney(listing.price)],
                ["Buyer agent compensation", listing.buyerAgentCompPct !== null ? `${listing.buyerAgentCompPct}%` : "Pending"],
              ]}
            />
          </InfoCard>

          <InfoCard
            id="property-description"
            title="4. Property description"
            complete={steps.find((s) => s.id === "property-description")?.complete ?? false}
            missingItems={missingByStep["property-description"] ?? []}
          >
            <p className="text-sm text-white/80">
              {listing.description || "No public description yet. Add one in dashboard editing to improve readiness."}
            </p>
          </InfoCard>

          <InfoCard
            id="mls-profile"
            title="5. MLS details"
            complete={steps.find((s) => s.id === "mls-profile")?.complete ?? false}
            missingItems={missingByStep["mls-profile"] ?? []}
          >
            <InfoGrid
              items={[
                ["MLS name", listing.mlsName || "Pending"],
                ["MLS number", listing.mlsNumber || "Pending"],
                ["Internal listing ID", listing.listingId || "Pending"],
                ["Listed on", formatDate(listing.listedOn)],
                ["Expires on", formatDate(listing.expiresOn)],
              ]}
            />
          </InfoCard>

          <InfoCard
            id="photos-media"
            title="6. Photos"
            complete={steps.find((s) => s.id === "photos-media")?.complete ?? false}
            missingItems={missingByStep["photos-media"] ?? []}
          >
            <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">Hero image</p>
              <p className="mt-1 text-sm text-white/75">{listing.heroImageUrl || "No image attached yet."}</p>
            </div>
          </InfoCard>

          <InfoCard
            id="complete-listing-setup"
            title="7. Complete listing setup"
            complete={steps.find((s) => s.id === "complete-listing-setup")?.complete ?? false}
            missingItems={missingByStep["complete-listing-setup"] ?? []}
          >
            <InfoGrid
              items={[
                ["Current status", listing.status],
                ["Setup completion", `${completionPct}%`],
                ["Finalized on", formatDate(listing.setupFinalizedAt)],
                ["Ready to publish", completionPct >= 85 && listing.status !== "INCOMPLETE" ? "Yes" : "Not yet"],
              ]}
            />
            <p className="mt-3 text-xs text-white/60">
              Finalize validates required setup fields server-side and sets your listing status to ACTIVE.
            </p>
            <div className="mt-4">
              <button
                type="button"
                disabled={!canFinalize || finalizing || listing.status !== "INCOMPLETE"}
                onClick={() => {
                  void finalizeSetup();
                }}
                className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {finalizing
                  ? "Finalizing..."
                  : listing.status !== "INCOMPLETE"
                    ? "Already finalized"
                    : "Finalize and mark ACTIVE"}
              </button>
            </div>
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
            href="/pricing"
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/35 hover:bg-white/10"
          >
            Upgrade listing options
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
            <p className="mt-3 text-sm text-white/80">
              Before continuing to photos, please confirm your images meet MLS upload rules:
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-white/85">
              <li>Use only photos you own, created, or licensed to use.</li>
              <li>Start with an exterior front photo as your first image.</li>
              <li>Avoid visible text/signage in photos (for example, &quot;For Sale&quot; signs).</li>
            </ol>
            <p className="mt-3 text-xs text-white/60">
              These checks help keep your listing compliant and avoid delays.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={acceptPhotoDisclaimer}
                className="rounded-full border border-emerald-400/60 bg-emerald-500/25 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30"
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({
  id,
  title,
  complete,
  missingItems,
  children,
}: {
  id: string;
  title: string;
  complete: boolean;
  missingItems: string[];
  children: ReactNode;
}) {
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
