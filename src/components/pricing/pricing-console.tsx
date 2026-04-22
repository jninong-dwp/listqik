"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { CockpitGauge } from "@/components/cockpit-gauge";
import { Container } from "@/components/container";
import {
  AddressAutocompleteInput,
  type ParsedPlace,
} from "@/components/pricing/address-autocomplete-input";
import { staticWizardUpgrades } from "@/data/pricing-static-upgrades";
import type { PlanId, WizardUpgrade } from "@/types/pricing-wizard";

type PropertyType =
  | "single-family"
  | "condo"
  | "vacant-land"
  | "townhouse-villa"
  | "multi-family"
  | "mobile-manufactured";

type Plan = {
  id: PlanId;
  name: string;
  badge: string;
  price: string;
  closeFee: string;
  listTerm: string;
  photos: string;
  support: string;
  highlight?: boolean;
  included: string[];
  optional: string[];
};

const plans: Plan[] = [
  {
    id: "subsonic",
    name: "Subsonic",
    badge: "Basic · Close Air Support",
    price: "$99",
    closeFee: "0.50% at closing",
    listTerm: "6 months",
    photos: "Up to 25 photos",
    support: "7-day support (chat/email/phone)",
    included: [
      "Broker-assisted listing submission target within 24 hours of complete docs",
      "Distribution to major home-search portals",
      "Required listing forms and disclosure workflow",
      "Unlimited listing edits while active",
      "Your contact details shown where listing rules allow",
      "Buyer inquiries routed to you",
      "You control buyer-agent concessions in negotiations",
    ],
    optional: [
      "Showing scheduler module",
      "Yard sign kit",
      "Open house directional sign pack",
      "Virtual tour publishing add-on",
      "Transaction coordinator support",
      "Offer/counter prep and review",
      "Comparative market analysis (CMA)",
      "Professional photography add-on",
    ],
  },
  {
    id: "supersonic",
    name: "Supersonic",
    badge: "Premium · Sound Barrier",
    price: "$195",
    closeFee: "0.25% at closing",
    listTerm: "6 months",
    photos: "Max-photo submission where listing rules allow",
    support: "7-day support (priority queue)",
    highlight: true,
    included: [
      "Everything in Subsonic (Basic)",
      "Lower compliance close-out fee",
      "Max-photo listing format for broader visual coverage",
      "Welcome onboarding call",
      "Automated valuation support where available",
    ],
    optional: [
      "Showing scheduler module",
      "Yard sign kit",
      "Open house directional sign pack",
      "Virtual tour publishing add-on",
      "Transaction coordinator support",
      "Offer/counter prep and review",
      "Comparative market analysis (CMA)",
      "Professional photography add-on",
    ],
  },
  {
    id: "hypersonic",
    name: "Hypersonic",
    badge: "Luxury · Darkstar Class",
    price: "$395",
    closeFee: "0.25% at closing",
    listTerm: "12 months",
    photos: "Max-photo submission where listing rules allow",
    support: "7-day support + enhanced setup",
    included: [
      "Everything in Supersonic (Premium)",
      "12-month listing window",
      "Showing scheduler included",
      "Yard sign kit included",
      "Directional sign pack included",
      "Open house publishing bundle included",
      "Virtual tour publishing included",
      "Transaction coordinator support included",
    ],
    optional: [
      "Offer/counter prep and review",
      "Comparative market analysis (CMA)",
      "Professional photography add-on",
      "Additional broker-facilitated listing territory",
    ],
  },
];

const propertyTypes: { id: PropertyType; label: string; description: string }[] = [
  {
    id: "single-family",
    label: "Single Family",
    description: "Detached home intended for one household.",
  },
  {
    id: "condo",
    label: "Condo",
    description: "Individually owned unit in a shared building/community.",
  },
  {
    id: "vacant-land",
    label: "Vacant Lot / Land",
    description: "Land parcel without residential structure.",
  },
  {
    id: "townhouse-villa",
    label: "Townhouse / Villa",
    description: "Attached or semi-attached home with shared walls.",
  },
  {
    id: "multi-family",
    label: "Multi-Family",
    description: "Property with multiple dwelling units.",
  },
  {
    id: "mobile-manufactured",
    label: "Mobile / Manufactured",
    description: "Factory-built residential structure.",
  },
];

type WizardState = {
  step: 1 | 2 | 3 | 4;
  plan: Plan | null;
  propertyAddress: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  fullName: string;
  email: string;
  phone: string;
  propertyType: PropertyType | "";
  selectedUpgrades: string[];
  agreementAccepted: boolean;
  password: string;
  passwordConfirm: string;
};

const initialState: WizardState = {
  step: 1,
  plan: null,
  propertyAddress: "",
  unit: "",
  city: "",
  state: "Texas",
  zip: "",
  county: "",
  fullName: "",
  email: "",
  phone: "",
  propertyType: "",
  selectedUpgrades: [],
  agreementAccepted: false,
  password: "",
  passwordConfirm: "",
};

export function PricingConsole() {
  const [wizard, setWizard] = useState<WizardState>(initialState);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardUpgrades, setWizardUpgrades] = useState<WizardUpgrade[]>([]);
  const [upgradesLoading, setUpgradesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isWizardOpen) return;
    let cancelled = false;
    setUpgradesLoading(true);
    fetch("/api/ghl/pricing/upgrades")
      .then((r) => r.json())
      .then((data: { ok?: boolean; upgrades?: WizardUpgrade[] }) => {
        if (cancelled) return;
        if (data?.ok && Array.isArray(data.upgrades) && data.upgrades.length > 0) {
          setWizardUpgrades(data.upgrades);
        } else {
          setWizardUpgrades(staticWizardUpgrades);
        }
      })
      .catch(() => {
        if (!cancelled) setWizardUpgrades(staticWizardUpgrades);
      })
      .finally(() => {
        if (!cancelled) setUpgradesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isWizardOpen]);

  const selectedUpgradeRows = useMemo(
    () => wizardUpgrades.filter((u) => wizard.selectedUpgrades.includes(u.slug)),
    [wizard.selectedUpgrades, wizardUpgrades],
  );
  const upgradesSubtotal = selectedUpgradeRows.reduce((sum, u) => sum + u.price, 0);

  function selectPlan(plan: Plan) {
    setWizard((prev) => ({
      ...prev,
      plan,
      step: 1,
      selectedUpgrades: [],
    }));
    setError("");
    setIsWizardOpen(true);
  }

  function closeWizard() {
    if (submitting) return;
    setIsWizardOpen(false);
  }

  function toggleUpgrade(slug: string) {
    setWizard((prev) => ({
      ...prev,
      selectedUpgrades: prev.selectedUpgrades.includes(slug)
        ? prev.selectedUpgrades.filter((s) => s !== slug)
        : [...prev.selectedUpgrades, slug],
    }));
  }

  const onAddressPlaceSelected = useCallback((place: ParsedPlace) => {
      setWizard((s) => ({
        ...s,
        propertyAddress: place.streetLine,
        unit: place.unit ? place.unit : s.unit,
        city: place.city || s.city,
        state: place.state || s.state,
        zip: place.zip || s.zip,
        county: place.county || s.county,
      }));
    },
    [],
  );

  function canGoStep2() {
    return (
      wizard.plan &&
      wizard.propertyAddress.trim().length > 5 &&
      wizard.city.trim().length > 1 &&
      wizard.state.trim().length > 1 &&
      wizard.zip.trim().length >= 5 &&
      wizard.county.trim().length > 1 &&
      wizard.fullName.trim().length > 1 &&
      wizard.email.includes("@") &&
      wizard.phone.trim().length >= 7
    );
  }

  function canSubmitIntake() {
    return (
      wizard.agreementAccepted &&
      wizard.password.length >= 8 &&
      wizard.passwordConfirm.length >= 8 &&
      wizard.password === wizard.passwordConfirm
    );
  }

  async function submitIntakeAndCreateAccount() {
    if (!wizard.plan || !wizard.propertyType) return;
    setSubmitting(true);
    setError("");

    const payload = {
      agreementAccepted: wizard.agreementAccepted,
      account: {
        fullName: wizard.fullName.trim(),
        email: wizard.email.trim(),
        phone: wizard.phone.trim(),
        password: wizard.password,
      },
      plan: {
        id: wizard.plan.id,
        name: wizard.plan.name,
        price: wizard.plan.price,
      },
      property: {
        address: wizard.propertyAddress.trim(),
        unit: wizard.unit.trim() || undefined,
        city: wizard.city.trim(),
        state: wizard.state.trim(),
        zip: wizard.zip.trim(),
        county: wizard.county.trim(),
        propertyType: wizard.propertyType,
      },
      upgrades: selectedUpgradeRows.map((u) => ({
        slug: u.slug,
        name: u.name,
        price: u.price,
        ghlProductId: u.ghlProductId,
      })),
    };

    const res = await fetch("/api/pricing/intake/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!res) {
      setSubmitting(false);
      setError("Network error while creating account.");
      return;
    }

    const data = (await res.json().catch(() => null)) as
      | { ok: boolean; error?: string }
      | null;
    if (!res.ok || !data?.ok) {
      setSubmitting(false);
      setError(data?.error || "Could not complete intake.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: wizard.email.trim(),
      password: wizard.password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    if (signInResult?.error) {
      setSubmitting(false);
      setError("Account created, but auto sign-in failed. Please use Log in.");
      return;
    }

    window.location.href = signInResult?.url ?? "/dashboard";
  }

  useEffect(() => {
    if (!isWizardOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isWizardOpen]);

  return (
    <div className="py-10 sm:py-14">
      <Container className="space-y-8 sm:space-y-10">
        <header className="cockpit-hud-frame p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
            <div className="font-mono text-xs tracking-[0.22em] text-emerald-300/80">
              LISTQIK PRICING CONSOLE
            </div>
            <div className="rounded border border-lime-500/40 bg-lime-950/30 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-lime-200">
              TEXAS · LIVE
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-end">
            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-lime-200 via-emerald-100 to-emerald-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                Pricing that keeps your equity in your hands.
              </h1>
              <p className="max-w-2xl text-sm text-muted sm:text-base">
                Select your speed tier, run property intake, choose upgrades, then accept the
                agreement to create your account and draft listing.
              </p>
            </div>
            <div className="flex flex-wrap items-end justify-start gap-2 sm:gap-4 lg:justify-end">
              <CockpitGauge label="VALUE" sublabel="RPM" value={83} size="sm" accent="emerald" />
              <CockpitGauge label="SPEED" sublabel="RPM" value={91} size="sm" accent="emerald" />
              <CockpitGauge label="COMPLIANCE" sublabel="RPM" value={88} size="sm" accent="emerald" />
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={[
                "glass-surface flex h-full min-w-0 flex-col p-5",
                plan.highlight
                  ? "border-emerald-400/45 shadow-[0_0_28px_rgba(16,185,129,0.2)]"
                  : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-white/60">{plan.badge}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{plan.name}</h2>
                </div>
                {plan.highlight ? (
                  <span className="rounded-full border border-emerald-300/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Recommended
                  </span>
                ) : null}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="font-mono text-3xl font-bold text-white">{plan.price}</div>
                <div className="mt-1 text-sm text-white/75">{plan.closeFee}</div>
                <dl className="mt-4 grid gap-2 text-sm text-white/80">
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/60">Listing term</dt>
                    <dd>{plan.listTerm}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/60">Photos</dt>
                    <dd>{plan.photos}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/60">Support</dt>
                    <dd className="text-right">{plan.support}</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 grid gap-4 text-sm">
                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-white/60">Included</h3>
                  <ul className="mt-2 grid gap-2 text-white/85">
                    {plan.included.map((item) => (
                      <li key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => selectPlan(plan)}
                  className="btn-primary w-full justify-center"
                >
                  Select {plan.name}
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 text-sm text-emerald-100/90">
          Brokerage-regulated services, including listing submission and compliance approval, are
          provided through a licensed brokerage. ListQik.com provides marketing, technology, and
          administrative support.
        </section>

        {isWizardOpen ? (
          <div
            className="fixed inset-0 z-50 grid place-items-end bg-slate-950/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Pricing intake wizard"
          >
            <section className="glass-surface h-[92vh] w-full overflow-y-auto rounded-t-2xl p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold tracking-widest text-white/70">PRICING INTAKE</div>
                <button
                  type="button"
                  onClick={closeWizard}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  Close
                </button>
              </div>

          <div className="mb-6 flex items-center justify-between gap-2">
            {[1, 2, 3, 4].map((step) => {
              const active = wizard.step === step;
              const complete = wizard.step > step;
              return (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <div
                    className={[
                      "grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold",
                      complete || active
                        ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
                        : "border-white/15 bg-black/30 text-white/50",
                    ].join(" ")}
                  >
                    {complete ? "✓" : step}
                  </div>
                  {step < 4 ? <div className="h-[2px] flex-1 bg-white/10" /> : null}
                </div>
              );
            })}
          </div>

          {wizard.plan ? (
            <div className="mb-4 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white/80">
              Selected package: <span className="font-semibold text-white">{wizard.plan.name}</span>{" "}
              ({wizard.plan.price})
            </div>
          ) : (
            <div className="mb-4 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white/70">
              Select a plan above to begin property intake.
            </div>
          )}

          {wizard.step === 1 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">Step 1: Property Details</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <AddressAutocompleteInput
                  label="Property address"
                  value={wizard.propertyAddress}
                  onChange={(v) => setWizard((s) => ({ ...s, propertyAddress: v }))}
                  onPlaceSelected={onAddressPlaceSelected}
                />
                <Input
                  label="Apt / Suite / Unit"
                  value={wizard.unit}
                  onChange={(v) => setWizard((s) => ({ ...s, unit: v }))}
                />
                <Input
                  label="City"
                  value={wizard.city}
                  onChange={(v) => setWizard((s) => ({ ...s, city: v }))}
                />
                <Input
                  label="State"
                  value={wizard.state}
                  onChange={(v) => setWizard((s) => ({ ...s, state: v }))}
                />
                <Input
                  label="ZIP / Postal"
                  value={wizard.zip}
                  onChange={(v) => setWizard((s) => ({ ...s, zip: v }))}
                />
                <Input
                  label="County"
                  value={wizard.county}
                  onChange={(v) => setWizard((s) => ({ ...s, county: v }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Full name"
                  value={wizard.fullName}
                  onChange={(v) => setWizard((s) => ({ ...s, fullName: v }))}
                />
                <Input
                  label="Email"
                  value={wizard.email}
                  onChange={(v) => setWizard((s) => ({ ...s, email: v }))}
                  type="email"
                />
                <Input
                  label="Phone"
                  value={wizard.phone}
                  onChange={(v) => setWizard((s) => ({ ...s, phone: v }))}
                  type="tel"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!canGoStep2()}
                  onClick={() => setWizard((s) => ({ ...s, step: 2 }))}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next: Property Type
                </button>
              </div>
            </div>
          ) : null}

          {wizard.step === 2 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">Step 2: Property Type</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {propertyTypes.map((type) => {
                  const selected = wizard.propertyType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setWizard((s) => ({ ...s, propertyType: type.id }))}
                      className={[
                        "rounded-2xl border p-4 text-left transition",
                        selected
                          ? "border-emerald-400/60 bg-emerald-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/30",
                      ].join(" ")}
                    >
                      <div className="font-semibold text-white">{type.label}</div>
                      <div className="mt-2 text-sm text-white/70">{type.description}</div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setWizard((s) => ({ ...s, step: 1 }))}
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!wizard.propertyType}
                  onClick={() => setWizard((s) => ({ ...s, step: 3 }))}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue: Upgrades
                </button>
              </div>
            </div>
          ) : null}

          {wizard.step === 3 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">Step 3: Package Upgrades</h2>
              {upgradesLoading ? (
                <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-6 text-sm text-white/65">
                  Loading add-ons from your store…
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2">
                {wizardUpgrades.map((item) => {
                  const selected = wizard.selectedUpgrades.includes(item.slug);
                  const recommended = wizard.plan
                    ? item.recommendedFor.includes(wizard.plan.id)
                    : false;
                  return (
                    <div
                      key={item.ghlProductId}
                      className={[
                        "rounded-2xl border p-4",
                        selected ? "border-emerald-400/60 bg-emerald-500/10" : "border-white/10 bg-white/5",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="mt-1 text-sm text-white/70">{item.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-xl font-bold text-white">${item.price}</div>
                          {recommended ? (
                            <div className="text-[11px] text-emerald-300/90">Recommended</div>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleUpgrade(item.slug)}
                          className={selected ? "btn-secondary w-full" : "btn-primary w-full justify-center"}
                        >
                          {selected
                            ? item.toggleRemoveLabel ?? `Remove ${item.name}`
                            : item.toggleAddLabel ?? `Add ${item.name}`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-white/70">Upgrade subtotal</div>
                  <div className="font-mono text-2xl font-bold text-white">${upgradesSubtotal}</div>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setWizard((s) => ({ ...s, step: 2 }))}
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setWizard((s) => ({ ...s, step: 4 }))}
                  disabled={submitting}
                >
                  Continue: Agreement
                </button>
              </div>
            </div>
          ) : null}
          {wizard.step === 4 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">Step 4: Agreement & Account Setup</h2>
              <div className="rounded-2xl border border-amber-300/35 bg-amber-950/25 p-4 text-sm text-amber-100/95">
                <p className="font-semibold">Test checkout bypass</p>
                <p className="mt-2 text-amber-100/85">
                  By continuing, you confirm this test flow bypasses card entry and directly creates
                  your seller account, active plan record, and an initial draft listing.
                </p>
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-white/85">
                <input
                  type="checkbox"
                  checked={wizard.agreementAccepted}
                  onChange={(e) => setWizard((s) => ({ ...s, agreementAccepted: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40"
                />
                <span>I understand and agree to create my account through this test flow.</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Password (min 8 chars)"
                  value={wizard.password}
                  onChange={(v) => setWizard((s) => ({ ...s, password: v }))}
                  type="password"
                />
                <Input
                  label="Confirm password"
                  value={wizard.passwordConfirm}
                  onChange={(v) => setWizard((s) => ({ ...s, passwordConfirm: v }))}
                  type="password"
                />
              </div>
              {!canSubmitIntake() && wizard.passwordConfirm ? (
                <div className="rounded-xl border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-300">
                  Passwords must match, be at least 8 characters, and agreement must be checked.
                </div>
              ) : null}
              {error ? (
                <div className="rounded-xl border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setWizard((s) => ({ ...s, step: 3 }))}
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={submitIntakeAndCreateAccount}
                  disabled={submitting || !canSubmitIntake()}
                >
                  {submitting ? "Creating account..." : "I Understand — Create Account"}
                </button>
              </div>
            </div>
          ) : null}
            </section>
          </div>
        ) : null}
      </Container>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "password";
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold tracking-widest text-white/60">{label.toUpperCase()}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
      />
    </label>
  );
}

