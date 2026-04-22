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
};

type SetupStep = {
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/dashboard/listings/${listingId}`, { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; listing?: ListingSetupData; error?: string }
          | null;
        if (!res.ok || !data?.ok || !data.listing) {
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
        title: "General verification",
        subtitle: "Address and base record integrity",
        complete: Boolean(listing.street && listing.city && listing.state && listing.zip),
      },
      {
        title: "Contact and ownership",
        subtitle: "Account, county, and listing ownership context",
        complete: Boolean(listing.county),
      },
      {
        title: "Price and compensation",
        subtitle: "List price and buyer-agent compensation",
        complete: listing.price > 0 && listing.buyerAgentCompPct !== null,
      },
      {
        title: "Property description",
        subtitle: "Public remarks and compliance-safe messaging",
        complete: listing.description.trim().length >= 40,
      },
      {
        title: "Photos and media",
        subtitle: "Hero image and media readiness",
        complete: Boolean(listing.heroImageUrl),
      },
      {
        title: "MLS profile",
        subtitle: "MLS source and listing identifiers",
        complete: Boolean(listing.mlsName || listing.mlsNumber || listing.listingId),
      },
      {
        title: "Compliance review",
        subtitle: "Operational status and publish readiness",
        complete: listing.status !== "INCOMPLETE",
      },
    ];
  }, [listing]);

  const completionCount = steps.filter((s) => s.complete).length;
  const completionPct = steps.length ? Math.round((completionCount / steps.length) * 100) : 0;

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
            <li key={step.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
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
                <p className="text-sm font-semibold text-emerald-100">{step.title}</p>
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
            This page reflects your current listing setup state. Edits happen on the dashboard listing editor.
          </p>
        </header>

        <div className="mt-5 grid gap-5">
          <InfoCard title="Property details">
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

          <InfoCard title="Plan and timeline">
            <InfoGrid
              items={[
                ["Plan", listing.planLabel || "Plan attached at purchase"],
                ["Status", listing.status],
                ["Ordered on", formatDate(listing.orderedOn)],
                ["Listed on", formatDate(listing.listedOn)],
                ["Expires on", formatDate(listing.expiresOn)],
              ]}
            />
          </InfoCard>

          <InfoCard title="Pricing profile">
            <InfoGrid
              items={[
                ["List price", formatMoney(listing.price)],
                ["Buyer agent compensation", listing.buyerAgentCompPct !== null ? `${listing.buyerAgentCompPct}%` : "Pending"],
              ]}
            />
          </InfoCard>

          <InfoCard title="Description and media">
            <p className="text-sm text-white/80">
              {listing.description || "No public description yet. Add one in dashboard editing to improve readiness."}
            </p>
            <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">Hero image</p>
              <p className="mt-1 text-sm text-white/75">{listing.heroImageUrl || "No image attached yet."}</p>
            </div>
          </InfoCard>

          <InfoCard title="MLS identifiers">
            <InfoGrid
              items={[
                ["MLS name", listing.mlsName || "Pending"],
                ["MLS number", listing.mlsNumber || "Pending"],
                ["Internal listing ID", listing.listingId || "Pending"],
              ]}
            />
          </InfoCard>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-emerald-500/25 pt-4">
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
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-emerald-950/15 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/80">{title}</h2>
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
