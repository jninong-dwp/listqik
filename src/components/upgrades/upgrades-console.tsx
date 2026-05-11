"use client";

import { useEffect, useMemo, useState } from "react";
import { staticWizardUpgrades } from "@/data/pricing-static-upgrades";

type ListingItem = {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  status: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function addressLine(listing: ListingItem) {
  return [listing.street, [listing.city, listing.state].filter(Boolean).join(", "), listing.zip]
    .filter(Boolean)
    .join(" · ");
}

export function UpgradesConsole() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch("/api/dashboard/listings", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; listings?: ListingItem[]; error?: string }
          | null;
        if (!res.ok || !data?.ok || !Array.isArray(data.listings)) {
          throw new Error(data?.error || "Could not load your listings.");
        }
        if (!cancelled) {
          setListings(data.listings);
          setSelectedListingId(data.listings[0]?.id || "");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load listings.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTotal = useMemo(
    () =>
      selectedSlugs.reduce((sum, slug) => {
        const row = staticWizardUpgrades.find((u) => u.slug === slug);
        return sum + (row?.price || 0);
      }, 0),
    [selectedSlugs],
  );

  function toggleSlug(slug: string) {
    setSelectedSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function startCheckout() {
    if (!selectedListingId) {
      setError("Select a listing first.");
      return;
    }
    if (selectedSlugs.length === 0) {
      setError("Select at least one upgrade.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/listings/${selectedListingId}/upgrades/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slugs: selectedSlugs }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; checkoutUrl?: string } | null;
      if (!res.ok || !data?.ok || !data.checkoutUrl) {
        setError(data?.error || "Could not start Stripe checkout.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error while starting checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="rounded-2xl border border-emerald-500/25 bg-black/40 p-5">
        <h1 className="text-2xl font-semibold text-white">Listing Upgrades</h1>
        <p className="mt-2 text-sm text-white/75">
          Choose a listing, select add-ons, and pay with Stripe Checkout.
        </p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-white/15 bg-black/30 p-5 text-sm text-white/75">Loading your listings...</div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-amber-300/35 bg-amber-950/20 p-5 text-sm text-amber-100">
          No listings found on your account yet.
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-white/15 bg-black/30 p-5">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/65">Listing</span>
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
              >
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {addressLine(listing)} ({listing.status})
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="rounded-2xl border border-white/15 bg-black/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/65">Upgrade catalog</p>
            <div className="mt-3 grid gap-2">
              {staticWizardUpgrades.map((upgrade) => {
                const checked = selectedSlugs.includes(upgrade.slug);
                return (
                  <label
                    key={upgrade.slug}
                    className={[
                      "flex cursor-pointer items-start justify-between gap-3 rounded-xl border px-3 py-2 transition",
                      checked ? "border-emerald-300/55 bg-emerald-500/10" : "border-white/15 bg-black/25 hover:border-white/30",
                    ].join(" ")}
                  >
                    <span className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSlug(upgrade.slug)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-white">{upgrade.name}</span>
                        <span className="block text-xs text-white/65">{upgrade.description}</span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-emerald-100">{formatMoney(upgrade.price)}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-black/30 p-5">
            <p className="text-sm text-white/80">
              Selected total: <span className="font-semibold text-white">{formatMoney(selectedTotal)}</span>
            </p>
            <button
              type="button"
              disabled={submitting || selectedSlugs.length === 0 || !selectedListingId}
              onClick={() => {
                void startCheckout();
              }}
              className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Redirecting..." : "Checkout with Stripe"}
            </button>
          </section>
        </>
      )}

      {error ? (
        <div className="rounded-xl border border-rose-400/40 bg-rose-950/35 p-3 text-sm text-rose-100">{error}</div>
      ) : null}
    </div>
  );
}

