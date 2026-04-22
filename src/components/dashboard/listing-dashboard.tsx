"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export type DashboardListing = {
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
  const [previewMode, setPreviewMode] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

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

      <section className="rounded-2xl border border-emerald-500/25 bg-black/45 p-5 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
        <h2 className="text-lg font-semibold text-emerald-100">Add a listing</h2>
        <p className="mt-1 text-sm text-white/70">
          Requires an active plan on your account (created when your paid order webhook runs, or claimed at
          registration if the purchase email matches).
        </p>
        {previewMode ? (
          <p className="mt-3 text-sm text-white/70">
            Disabled in preview mode. Turn auth back on to create and manage live listings.
          </p>
        ) : (
          <AddListingForm
            onCreated={() => {
              void load();
            }}
            onError={setError}
          />
        )}
      </section>

      {loading ? (
        <p className="text-sm text-white/70">Loading your listings…</p>
      ) : listings.length === 0 ? (
        <p className="text-sm text-white/70">No listings yet. Add your first property above.</p>
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
                        onClick={() => setExpanded(l.id)}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45"
                      >
                        Edit listing
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpanded(l.id)}
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45"
                      >
                        Change status
                      </button>
                      <a
                        href="/pricing"
                        className="rounded-lg border border-indigo-400/35 bg-indigo-950/35 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:border-indigo-300/70 hover:bg-indigo-900/45"
                      >
                        Upgrade your listing
                      </a>
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-indigo-400/20 bg-indigo-950/20 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100/45"
                      >
                        Upload document
                      </button>
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-indigo-400/20 bg-indigo-950/20 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100/45"
                      >
                        Schedule open house
                      </button>
                      <button
                        type="button"
                        disabled
                        className="cursor-not-allowed rounded-lg border border-indigo-400/20 bg-indigo-950/20 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100/45"
                      >
                        Download MLS listing
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
                        disabled
                        className="cursor-not-allowed rounded-lg border border-indigo-400/20 bg-indigo-950/20 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-indigo-100/45"
                      >
                        Offer from a buyer
                      </button>
                    </div>
                  </div>
                </div>

                {open ? (
                  <div className="border-t border-emerald-500/20 bg-emerald-950/20 p-4 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Field label="County" value={l.county} />
                      <Field label="MLS name" value={l.mlsName} />
                      <Field label="MLS number" value={l.mlsNumber} />
                      <Field label="Listing ID" value={l.listingId} />
                      <Field label="Ordered on" value={formatDate(l.orderedOn)} />
                      <Field label="Listed on" value={formatDate(l.listedOn)} />
                      <Field label="Expires on" value={formatDate(l.expiresOn)} />
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <label className="block text-sm">
                        <span className="font-semibold text-emerald-100">Description</span>
                        <textarea
                          className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/40"
                          rows={4}
                          defaultValue={l.description}
                          id={`desc-${l.id}`}
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-sm">
                          <span className="font-semibold text-emerald-100">Price</span>
                          <input
                            type="number"
                            className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50"
                            defaultValue={l.price}
                            id={`price-${l.id}`}
                          />
                        </label>
                        <label className="block text-sm">
                          <span className="font-semibold text-emerald-100">Buyer agent %</span>
                          <input
                            type="number"
                            step="0.01"
                            className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50"
                            defaultValue={l.buyerAgentCompPct ?? ""}
                            id={`bac-${l.id}`}
                          />
                        </label>
                        <label className="block text-sm sm:col-span-2">
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
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={previewMode || savingId === l.id}
                        onClick={() => {
                          const desc = (document.getElementById(`desc-${l.id}`) as HTMLTextAreaElement).value;
                          const price = Number((document.getElementById(`price-${l.id}`) as HTMLInputElement).value);
                          const bacRaw = (document.getElementById(`bac-${l.id}`) as HTMLInputElement).value;
                          const status = (document.getElementById(`status-${l.id}`) as HTMLSelectElement).value;
                          const buyerAgentCompPct =
                            bacRaw === "" ? null : Number.parseFloat(bacRaw);
                          void patchListing(l.id, {
                            description: desc,
                            price,
                            buyerAgentCompPct: Number.isFinite(buyerAgentCompPct as number)
                              ? buyerAgentCompPct
                              : null,
                            status,
                          });
                        }}
                        className="rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-50"
                      >
                        {previewMode ? "Preview only" : savingId === l.id ? "Saving…" : "Save changes"}
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

function AddListingForm({
  onCreated,
  onError,
}: {
  onCreated: () => void;
  onError: (msg: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const street = String(fd.get("street") ?? "").trim();
        const city = String(fd.get("city") ?? "").trim();
        const state = String(fd.get("state") ?? "").trim();
        const zip = String(fd.get("zip") ?? "").trim();
        const price = Number(fd.get("price"));
        const planLabel = String(fd.get("planLabel") ?? "").trim();
        const county = String(fd.get("county") ?? "").trim();
        if (!street || !city || !state || !zip || !Number.isFinite(price)) {
          onError("Fill street, city, state, zip, and price.");
          return;
        }
        onError(null);
        setBusy(true);
        try {
          const res = await fetch("/api/dashboard/listings", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ street, city, state, zip, price, planLabel, county }),
          });
          const data = (await res.json()) as { ok?: boolean; error?: string };
          if (!res.ok || !data.ok) {
            onError(data.error ?? "Could not create listing.");
            return;
          }
          e.currentTarget.reset();
          onCreated();
        } catch {
          onError("Network error.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        name="street"
        placeholder="Street address"
        className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/40"
      />
      <input
        name="city"
        placeholder="City"
        className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/40"
      />
      <input
        name="state"
        placeholder="State"
        className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/40"
      />
      <input
        name="zip"
        placeholder="ZIP"
        className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/40"
      />
      <input
        name="county"
        placeholder="County (optional)"
        className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/40"
      />
      <input
        name="planLabel"
        placeholder="Plan label (e.g. Gold · 25 photos)"
        className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/40"
      />
      <input
        name="price"
        type="number"
        placeholder="List price"
        className="rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50 placeholder:text-emerald-200/40"
      />
      <div className="sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full border border-emerald-400/70 bg-emerald-500/20 px-5 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create listing"}
        </button>
      </div>
    </form>
  );
}
