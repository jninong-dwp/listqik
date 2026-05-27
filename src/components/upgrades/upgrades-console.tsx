"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GoogleAdsPurchaseConversion } from "@/components/analytics/google-ads-purchase-conversion";
import { staticWizardUpgrades } from "@/data/pricing-static-upgrades";
import {
  clearPendingUpgradeSlugs,
  readPendingUpgradeSlugs,
  storePendingUpgradeSlugs,
} from "@/lib/pending-upgrades-cache";

type ListingItem = {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  status: string;
};

type UpgradeCheckoutStatus = {
  loading: boolean;
  sessionId: string | null;
  paid: boolean;
  transactionId: string | null;
  amountTotal: number | null;
  currency: string;
  upgradeSlugs: string[];
  error: string | null;
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
  const { status: authStatus } = useSession();
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get("checkout")?.trim() || "";
  const querySessionId = searchParams.get("session_id")?.trim() || "";
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<UpgradeCheckoutStatus>({
    loading: false,
    sessionId: null,
    paid: false,
    transactionId: null,
    amountTotal: null,
    currency: "USD",
    upgradeSlugs: [],
    error: null,
  });

  useEffect(() => {
    const cached = readPendingUpgradeSlugs();
    if (cached.length > 0) {
      setSelectedSlugs(cached);
    }
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setListings([]);
      setSelectedListingId("");
      setHasActivePlan(false);
      setListingsLoading(false);
      return;
    }

    let cancelled = false;
    setListingsLoading(true);
    setError("");
    fetch("/api/dashboard/listings", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | {
              ok?: boolean;
              listings?: ListingItem[];
              effectivePlan?: { entitlements?: { hasActivePlan?: boolean } };
              error?: string;
            }
          | null;
        if (!res.ok || !data?.ok) {
          if (res.status === 401) return;
          throw new Error(data?.error || "Could not load your listings.");
        }
        if (!cancelled) {
          const rows = Array.isArray(data.listings) ? data.listings : [];
          setListings(rows);
          setSelectedListingId(rows[0]?.id || "");
          setHasActivePlan(Boolean(data.effectivePlan?.entitlements?.hasActivePlan));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load listings.");
        }
      })
      .finally(() => {
        if (!cancelled) setListingsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  const selectedTotal = useMemo(
    () =>
      selectedSlugs.reduce((sum, slug) => {
        const row = staticWizardUpgrades.find((u) => u.slug === slug);
        return sum + (row?.price || 0);
      }, 0),
    [selectedSlugs],
  );

  const purchasedUpgradeNames = useMemo(() => {
    return checkoutStatus.upgradeSlugs
      .map((slug) => staticWizardUpgrades.find((upgrade) => upgrade.slug === slug)?.name)
      .filter((name): name is string => Boolean(name));
  }, [checkoutStatus.upgradeSlugs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (querySessionId) {
      try {
        window.sessionStorage.setItem("latestUpgradeCheckoutSessionId", querySessionId);
      } catch {
        /* ignore storage access issues */
      }
    }
  }, [querySessionId]);

  useEffect(() => {
    if (checkoutState !== "success") {
      setCheckoutStatus((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));
      return;
    }

    const sessionId =
      querySessionId ||
      (() => {
        try {
          return window.sessionStorage.getItem("latestUpgradeCheckoutSessionId") || "";
        } catch {
          return "";
        }
      })();

    if (!sessionId) {
      setCheckoutStatus({
        loading: false,
        sessionId: null,
        paid: false,
        transactionId: null,
        amountTotal: null,
        currency: "USD",
        upgradeSlugs: [],
        error: "Checkout succeeded, but the session reference is missing. Refresh and try again.",
      });
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const pollStatus = async () => {
      if (cancelled) return;
      setCheckoutStatus((prev) => ({
        ...prev,
        loading: true,
        sessionId,
        error: null,
      }));

      try {
        const res = await fetch(
          `/api/pricing/checkout/status?sessionId=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        const data = (await res.json().catch(() => null)) as
          | {
              ok?: boolean;
              upgradesPaid?: boolean;
              error?: string;
              upgradesPurchase?: {
                transactionId?: string | null;
                amountTotal?: number | null;
                currency?: string | null;
                upgradeSlugs?: string[];
              } | null;
            }
          | null;

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Could not verify upgrade payment status.");
        }

        const paid = Boolean(data.upgradesPaid);
        const purchase = data.upgradesPurchase;
        const hasPurchaseData =
          Boolean(purchase?.transactionId) &&
          typeof purchase?.amountTotal === "number" &&
          purchase.amountTotal > 0;

        if (!cancelled) {
          setCheckoutStatus({
            loading: !hasPurchaseData && attempts < 14,
            sessionId,
            paid,
            transactionId: purchase?.transactionId?.trim() || sessionId,
            amountTotal: typeof purchase?.amountTotal === "number" ? purchase.amountTotal : null,
            currency: purchase?.currency?.trim() || "USD",
            upgradeSlugs: Array.isArray(purchase?.upgradeSlugs) ? purchase.upgradeSlugs : [],
            error: null,
          });
        }

        if (paid && hasPurchaseData) {
          clearPendingUpgradeSlugs();
        }

        if ((!paid || !hasPurchaseData) && attempts < 14) {
          attempts += 1;
          window.setTimeout(() => {
            void pollStatus();
          }, 1500);
        }
      } catch (err) {
        if (!cancelled) {
          setCheckoutStatus({
            loading: false,
            sessionId,
            paid: false,
            transactionId: null,
            amountTotal: null,
            currency: "USD",
            upgradeSlugs: [],
            error:
              err instanceof Error ? err.message : "Could not verify upgrade payment status.",
          });
        }
      }
    };

    void pollStatus();

    return () => {
      cancelled = true;
    };
  }, [checkoutState, querySessionId]);

  function toggleSlug(slug: string) {
    setSelectedSlugs((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      storePendingUpgradeSlugs(next);
      return next;
    });
  }

  async function startCheckout() {
    if (selectedSlugs.length === 0) {
      setError("Select at least one upgrade.");
      return;
    }

    storePendingUpgradeSlugs(selectedSlugs);

    if (authStatus !== "authenticated" || !hasActivePlan) {
      window.location.href = "/pricing?planRequired=1";
      return;
    }

    if (!selectedListingId) {
      setError(
        "You need an active listing on your account before checkout. Finish plan intake from your dashboard, then return here.",
      );
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
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        checkoutUrl?: string;
        checkoutSessionId?: string | null;
      } | null;

      if (res.status === 403 && data?.error?.toLowerCase().includes("plan")) {
        window.location.href = "/pricing?planRequired=1";
        return;
      }

      if (!res.ok || !data?.ok || !data.checkoutUrl) {
        setError(data?.error || "Could not start Stripe checkout.");
        return;
      }

      try {
        if (data.checkoutSessionId) {
          window.sessionStorage.setItem(
            "latestUpgradeCheckoutSessionId",
            String(data.checkoutSessionId),
          );
        }
      } catch {
        /* ignore storage access issues */
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error while starting checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  const showCatalog = checkoutState !== "success" || !checkoutStatus.paid;
  const sessionLoading = authStatus === "loading";

  return (
    <div className="space-y-5">
      {checkoutState === "success" && checkoutStatus.paid && checkoutStatus.transactionId && checkoutStatus.amountTotal ? (
        <GoogleAdsPurchaseConversion
          transactionId={checkoutStatus.transactionId}
          value={checkoutStatus.amountTotal}
          currency={checkoutStatus.currency}
        />
      ) : null}

      <header className="rounded-2xl border border-emerald-500/25 bg-black/40 p-5">
        <h1 className="text-2xl font-semibold text-white">Listing Upgrades</h1>
        <p className="mt-2 text-sm text-white/75">
          Browse optional add-ons for your listing. Select what you want, then checkout when you are
          ready.
        </p>
      </header>

      {checkoutState === "success" ? (
        <div className="rounded-2xl border border-emerald-400/35 bg-emerald-950/20 p-5 text-sm text-emerald-100/90">
          <p className="font-semibold text-emerald-100">
            {checkoutStatus.paid ? "Upgrade checkout complete." : "Verifying upgrade payment..."}
          </p>
          {checkoutStatus.loading ? (
            <p className="mt-2 text-emerald-100/80">
              We are confirming your Stripe payment and loading the purchase details.
            </p>
          ) : checkoutStatus.error ? (
            <p className="mt-2 text-rose-200">{checkoutStatus.error}</p>
          ) : (
            <>
              {purchasedUpgradeNames.length > 0 ? (
                <p className="mt-2">
                  Purchased upgrades:{" "}
                  <span className="font-semibold text-white">{purchasedUpgradeNames.join(", ")}</span>
                </p>
              ) : null}
              {checkoutStatus.amountTotal ? (
                <p className="mt-1">
                  Total paid:{" "}
                  <span className="font-semibold text-white">
                    {formatMoney(checkoutStatus.amountTotal)}
                  </span>
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {checkoutState === "cancelled" ? (
        <div className="rounded-2xl border border-amber-300/35 bg-amber-950/20 p-5 text-sm text-amber-100">
          Upgrade checkout was cancelled. Your selected add-ons are still here if you want to try
          again.
        </div>
      ) : null}

      {showCatalog ? (
        <>
          {authStatus === "unauthenticated" ? (
            <div className="rounded-2xl border border-sky-400/30 bg-sky-950/20 p-4 text-sm text-sky-100/90">
              You can browse and select upgrades without signing in. Checkout requires an active
              listing plan — we will send you to pricing first if needed.
            </div>
          ) : null}

          {authStatus === "authenticated" && !listingsLoading && !hasActivePlan ? (
            <div className="rounded-2xl border border-amber-300/35 bg-amber-950/20 p-4 text-sm text-amber-100">
              Purchase a listing plan before checkout.{" "}
              <Link href="/pricing?planRequired=1" className="font-semibold text-white underline">
                View pricing
              </Link>
            </div>
          ) : null}

          {authStatus === "authenticated" && !listingsLoading && hasActivePlan && listings.length === 0 ? (
            <div className="rounded-2xl border border-amber-300/35 bg-amber-950/20 p-4 text-sm text-amber-100">
              Your plan is active, but no listing is on file yet. Finish intake from your{" "}
              <Link href="/dashboard" className="font-semibold text-white underline">
                dashboard
              </Link>{" "}
              before paying for upgrades.
            </div>
          ) : null}

          {listings.length > 0 ? (
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
          ) : null}

          <section className="rounded-2xl border border-white/15 bg-black/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/65">Upgrade catalog</p>
            {sessionLoading || listingsLoading ? (
              <p className="mt-3 text-sm text-white/60">Loading account details...</p>
            ) : null}
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
              disabled={submitting || selectedSlugs.length === 0 || sessionLoading}
              onClick={() => {
                void startCheckout();
              }}
              className="rounded-full border border-emerald-400/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Redirecting..." : "Continue to checkout"}
            </button>
          </section>
        </>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-400/40 bg-rose-950/35 p-3 text-sm text-rose-100">{error}</div>
      ) : null}
    </div>
  );
}
