"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CockpitGauge } from "@/components/cockpit-gauge";
import { Container } from "@/components/container";
import {
  AddressAutocompleteInput,
  type ParsedPlace,
} from "@/components/pricing/address-autocomplete-input";
import type { PlanId } from "@/types/pricing-wizard";

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
    badge: "Basic · Essential",
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
    badge: "Premium · Most Popular",
    price: "$295",
    closeFee: "0.3% at closing",
    listTerm: "6 months",
    photos: "Max Photos",
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
    badge: "Luxury · Full Service",
    price: "$595",
    closeFee: "0.25% at closing",
    listTerm: "12 months",
    photos: "Max Photos",
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
      "Professional photography included",
    ],
    optional: [
      "Offer/counter prep and review",
      "Comparative market analysis (CMA)",
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
  step: 1 | 2 | 3;
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
};

export function PricingConsole() {
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""),
    [],
  );
  const [wizard, setWizard] = useState<WizardState>(initialState);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const submitting = false;
  const [error, setError] = useState("");
  const [planCheckoutLoading, setPlanCheckoutLoading] = useState(false);
  const [planCheckoutUrl, setPlanCheckoutUrl] = useState<string | null>(null);
  const [planCheckoutClientSecret, setPlanCheckoutClientSecret] = useState<string | null>(null);
  const [checkingPlanPayment, setCheckingPlanPayment] = useState(false);
  const [planPaymentRecorded, setPlanPaymentRecorded] = useState(false);
  const [, setPlanAutoAdvanced] = useState(false);
  const [handoffBusy, setHandoffBusy] = useState<"dashboard" | "upgrades" | null>(null);

  const advanceToUpgradesIfReady = useCallback(() => {
    setPlanAutoAdvanced((alreadyAdvanced) => {
      if (alreadyAdvanced) return alreadyAdvanced;
      setWizard((current) => (current.step === 2 ? { ...current, step: 3 } : current));
      return true;
    });
  }, []);

  function selectPlan(plan: Plan) {
    const nextSessionId =
      typeof window !== "undefined" && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setWizard((prev) => ({
      ...prev,
      plan,
      step: 1,
    }));
    setCheckoutSessionId(nextSessionId);
    setPlanCheckoutUrl(null);
    setPlanCheckoutClientSecret(null);
    setPlanPaymentRecorded(false);
    setPlanAutoAdvanced(false);
    setError("");
    setIsWizardOpen(true);
  }

  function closeWizard() {
    if (submitting) return;
    setIsWizardOpen(false);
  }

  async function syncCheckoutSession() {
    if (!wizard.plan || !checkoutSessionId) return false;
    const email = wizard.email.trim().toLowerCase();
    if (!email.includes("@")) return false;
    const res = await fetch("/api/pricing/checkout/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId: checkoutSessionId,
        email,
        planId: wizard.plan.id,
        selectedUpgradeSlugs: [],
      }),
    }).catch(() => null);
    return Boolean(res?.ok);
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

  function canContinueToUpgrades() {
    return (
      wizard.plan &&
      Boolean(wizard.propertyType) &&
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

  const checkCheckoutStatus = useCallback(async () => {
    if (!checkoutSessionId) return null;
    const res = await fetch(`/api/pricing/checkout/status?sessionId=${encodeURIComponent(checkoutSessionId)}`, {
      cache: "no-store",
    }).catch(() => null);
    if (!res) {
      setError("Could not verify payment status. Check your connection and try again.");
      return null;
    }
    const data = (await res.json().catch(() => null)) as
      | {
          ok?: boolean;
          planPaid?: boolean;
          error?: string;
        }
      | null;
    if (!res.ok || !data?.ok) {
      setError(data?.error || "Could not verify payment status.");
      return null;
    }
    setPlanPaymentRecorded(Boolean(data.planPaid));
    if (data.planPaid) {
      setError("");
      advanceToUpgradesIfReady();
    }
    return data;
  }, [checkoutSessionId, advanceToUpgradesIfReady]);

  const checkPlanPaymentStatus = useCallback(async (showPendingError = false) => {
    if (!checkoutSessionId) return false;
    setCheckingPlanPayment(true);
    const data = await checkCheckoutStatus();
    setCheckingPlanPayment(false);
    if (!data) return false;
    if (!data.planPaid) {
      if (showPendingError) {
        setError("Payment is not recorded yet. Please complete checkout and try again.");
      }
      return false;
    }
    setError("");
    return true;
  }, [checkoutSessionId, checkCheckoutStatus]);

  const handleEmbeddedCheckoutComplete = useCallback(() => {
    // Stripe reports completion in the embedded frame; advance UX immediately.
    setPlanPaymentRecorded(true);
    advanceToUpgradesIfReady();
    // Keep server-side confirmation in the background for resiliency.
    void checkPlanPaymentStatus(false);
  }, [advanceToUpgradesIfReady, checkPlanPaymentStatus]);

  async function continueAfterPayment(destination: "dashboard" | "upgrades") {
    if (!checkoutSessionId) {
      setError("Could not find your checkout session. Please refresh and try again.");
      return;
    }
    setError("");
    setHandoffBusy(destination);
    try {
      const res = await fetch("/api/pricing/checkout/finalize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: checkoutSessionId, destination }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; nextUrl?: string; error?: string }
        | null;
      if (!res.ok || !data?.ok || !data.nextUrl) {
        setError(data?.error || "Could not continue yet. Please retry in a few seconds.");
        return;
      }
      window.location.href = data.nextUrl;
    } catch {
      setError("Network error while preparing your account handoff.");
    } finally {
      setHandoffBusy(null);
    }
  }

  async function openPlanCheckoutStep() {
    if (!canContinueToUpgrades()) return;
    if (!wizard.plan) return;
    setWizard((s) => ({ ...s, step: 2 }));
    setPlanCheckoutLoading(true);
    const synced = await syncCheckoutSession();
    if (!synced) {
      setPlanCheckoutLoading(false);
      setError("Could not initialize checkout session. Please retry.");
      return;
    }
    const res = await fetch("/api/stripe/pricing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        checkoutSessionId,
        checkoutKind: "plan",
        source: "pricing-console",
        embedded: true,
        plan: {
          id: wizard.plan.id,
          name: wizard.plan.name,
          price: wizard.plan.price,
          closeFee: wizard.plan.closeFee,
        },
        contact: {
          fullName: wizard.fullName.trim(),
          email: wizard.email.trim().toLowerCase(),
          phone: wizard.phone.trim(),
        },
        property: {
          address: wizard.propertyAddress.trim(),
          unit: wizard.unit.trim(),
          city: wizard.city.trim(),
          state: wizard.state.trim(),
          zip: wizard.zip.trim(),
          county: wizard.county.trim(),
          propertyType: wizard.propertyType.trim(),
        },
        upgrades: [],
      }),
    }).catch(() => null);
    setPlanCheckoutLoading(false);
    if (!res) {
      setError("Could not create Stripe checkout. Please try again.");
      return;
    }
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; checkoutUrl?: string | null; checkoutClientSecret?: string | null; error?: string }
      | null;
    if (!res.ok || !data?.ok || (!data.checkoutClientSecret && !data.checkoutUrl)) {
      setError(data?.error || "Stripe checkout URL was not generated.");
      return;
    }
    setPlanCheckoutUrl(data.checkoutUrl ?? null);
    setPlanCheckoutClientSecret(data.checkoutClientSecret ?? null);
    setError("");
  }

  useEffect(() => {
    if (!isWizardOpen || wizard.step !== 2 || !wizard.plan || !checkoutSessionId || planPaymentRecorded) return;
    const timer = window.setInterval(() => {
      void checkPlanPaymentStatus(false);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isWizardOpen, wizard.step, wizard.plan, checkoutSessionId, planPaymentRecorded, checkPlanPaymentStatus]);

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
            <div className="rounded border border-amber-300/70 bg-amber-500/20 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.35)]">
              TEXAS · LIVE
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-end">
            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-lime-200 via-emerald-100 to-emerald-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                Simple pricing to help you keep more from your sale.
              </h1>
              <p className="max-w-2xl text-sm text-muted sm:text-base">
                Select your speed tier, complete property intake, finish checkout, and continue to
                your success screen.
              </p>
            </div>
            <div className="flex flex-wrap items-end justify-start gap-2 sm:gap-4 lg:justify-end">
              <CockpitGauge label="VALUE" sublabel="RPM" value={83} size="sm" accent="emerald" />
              <CockpitGauge label="SPEED" sublabel="RPM" value={91} size="sm" accent="emerald" />
              <CockpitGauge label="COMPLIANCE" sublabel="RPM" value={88} size="sm" accent="emerald" />
            </div>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 p-3 sm:p-4 lg:p-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[url('/cockpit-homepage.webp')] bg-cover bg-center opacity-60"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/25"
          />
          <section className="relative z-[1] grid gap-5 lg:grid-cols-3">
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

                <div className="mt-4 min-h-[206px] rounded-2xl border border-white/10 bg-black/25 p-4">
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

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => selectPlan(plan)}
                    className="btn-primary w-full justify-center"
                  >
                    Select {plan.name}
                  </button>
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
              </article>
            ))}
          </section>
        </div>

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
            {[1, 2, 3].map((step) => {
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
                  {step < 3 ? <div className="h-[2px] flex-1 bg-white/10" /> : null}
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
              <h2 className="text-xl font-semibold text-white">Step 1: Property &amp; contact</h2>
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
              <label className="grid w-full gap-1.5">
                <span className="text-xs font-semibold tracking-widest text-white/60">PROPERTY TYPE</span>
                <select
                  value={wizard.propertyType}
                  onChange={(e) =>
                    setWizard((s) => ({
                      ...s,
                      propertyType: (e.target.value || "") as PropertyType | "",
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                >
                  <option value="" className="bg-slate-900">
                    Select property type…
                  </option>
                  {propertyTypes.map((type) => (
                    <option key={type.id} value={type.id} className="bg-slate-900">
                      {type.label} — {type.description}
                    </option>
                  ))}
                </select>
              </label>
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
                  disabled={!canContinueToUpgrades() || planCheckoutLoading}
                  onClick={() => {
                    void openPlanCheckoutStep();
                  }}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {planCheckoutLoading ? "Preparing checkout..." : "Next: Plan Checkout"}
                </button>
              </div>
            </div>
          ) : null}

          {wizard.step === 2 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">Step 2: Plan checkout (Stripe)</h2>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/85">
                <p className="font-semibold text-white">Order summary</p>
                <ul className="mt-3 grid gap-2">
                  <li className="flex justify-between gap-3">
                    <span className="text-white/65">Plan</span>
                    <span>
                      {wizard.plan?.name} — {wizard.plan?.price}
                    </span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span className="text-white/65">Property</span>
                    <span className="text-right">
                      {wizard.propertyAddress}
                      {wizard.unit ? `, ${wizard.unit}` : ""}, {wizard.city}, {wizard.state}{" "}
                      {wizard.zip}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/85">
                {planCheckoutClientSecret ? (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{
                        clientSecret: planCheckoutClientSecret,
                        onComplete: handleEmbeddedCheckoutComplete,
                      }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                ) : planCheckoutUrl ? (
                  <div className="space-y-3">
                    <p>
                      Stripe Checkout opens in a secure hosted page. Complete payment there, then
                      return to continue.
                    </p>
                    <a
                      href={planCheckoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary inline-flex"
                    >
                      Open Stripe checkout
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-sm text-white/70">
                    {planCheckoutLoading
                      ? "Preparing plan checkout..."
                      : "Plan checkout is not ready yet. Please go back and retry."}
                  </div>
                )}
              </div>
              {error ? (
                <div className="rounded-xl border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-start">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setWizard((s) => ({ ...s, step: 1 }));
                    setError("");
                  }}
                  disabled={submitting}
                >
                  Back
                </button>
              </div>
            </div>
          ) : null}
          {wizard.step === 3 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">Step 3: Success</h2>
              <div className="rounded-2xl border border-emerald-400/35 bg-emerald-950/20 p-4 text-sm text-emerald-100/90">
                <p className="font-semibold text-emerald-100">Your plan checkout is complete.</p>
                <p className="mt-2">
                  You can now add optional upgrades from the dedicated upgrades page, or continue
                  straight to your dashboard.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/85">
                <p>
                  Selected plan: <span className="font-semibold text-white">{wizard.plan?.name}</span>
                </p>
                <p className="mt-1">
                  Property: {wizard.propertyAddress}
                  {wizard.unit ? `, ${wizard.unit}` : ""}, {wizard.city}, {wizard.state} {wizard.zip}
                </p>
              </div>
              {error ? (
                <div className="rounded-xl border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-300">
                  {error}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setWizard((s) => ({ ...s, step: 2 }))}
                  disabled={submitting}
                >
                  Back
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void continueAfterPayment("upgrades");
                    }}
                    disabled={handoffBusy !== null}
                    className="btn-secondary disabled:opacity-50"
                  >
                    {handoffBusy === "upgrades" ? "Preparing..." : "Add upgrades"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void continueAfterPayment("dashboard");
                    }}
                    disabled={handoffBusy !== null}
                    className="btn-primary disabled:opacity-50"
                  >
                    {handoffBusy === "dashboard" ? "Preparing..." : "Proceed to user dashboard"}
                  </button>
                </div>
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

