"use client";

import { useCallback, useMemo, useState } from "react";
import { CockpitGauge } from "@/components/cockpit-gauge";
import { Container } from "@/components/container";
import {
  AddressAutocompleteInput,
  type ParsedPlace,
} from "@/components/pricing/address-autocomplete-input";

type PlanId = "subsonic" | "supersonic" | "hypersonic";
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

type Upgrade = {
  slug: string;
  name: string;
  description: string;
  price: number;
  ghlProductId: string;
  recommendedFor: PlanId[];
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
      "MLS launch target within 24 hours of complete docs",
      "Distribution to major home-search portals",
      "Required listing forms and disclosure workflow",
      "Unlimited listing edits while active",
      "Your contact details shown in MLS where allowed",
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
    photos: "Max photos allowed by MLS",
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
    photos: "Max photos allowed by MLS",
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
      "Additional MLS territory",
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

const upgrades: Upgrade[] = [
  {
    slug: "pro-photography",
    name: "Pro Photography Boost",
    description: "Photo package tuned for stronger portal CTR and visual quality.",
    price: 495,
    ghlProductId: "prod_pro_photography",
    recommendedFor: ["subsonic", "supersonic", "hypersonic"],
  },
  {
    slug: "comparative-market-analysis",
    name: "Comparative Market Analysis (CMA)",
    description: "Pricing support report to calibrate list price and negotiation range.",
    price: 195,
    ghlProductId: "prod_cma",
    recommendedFor: ["subsonic", "supersonic", "hypersonic"],
  },
  {
    slug: "showing-service",
    name: "Online Showing Service",
    description: "Centralized showing requests and schedule coordination.",
    price: 59,
    ghlProductId: "prod_showing_service",
    recommendedFor: ["subsonic", "supersonic"],
  },
  {
    slug: "yard-sign",
    name: "Yard Sign Kit",
    description: "Professional yard sign package with shipping/handling.",
    price: 49,
    ghlProductId: "prod_yard_sign",
    recommendedFor: ["subsonic", "supersonic"],
  },
  {
    slug: "lockbox",
    name: "Lockbox",
    description: "Combination lockbox add-on for agent-access showings.",
    price: 49,
    ghlProductId: "prod_lockbox",
    recommendedFor: ["subsonic", "supersonic", "hypersonic"],
  },
  {
    slug: "virtual-tour",
    name: "Add a Video / Tour",
    description: "Virtual walkthrough/3D tour posting module.",
    price: 40,
    ghlProductId: "prod_virtual_tour",
    recommendedFor: ["subsonic", "supersonic", "hypersonic"],
  },
  {
    slug: "open-house-signs",
    name: "Open House Directional Signs",
    description: "Directional signage pack for event-day traffic flow.",
    price: 49,
    ghlProductId: "prod_open_house_signs",
    recommendedFor: ["subsonic", "supersonic"],
  },
  {
    slug: "offer-negotiation-support",
    name: "Offer / Counter Review",
    description: "Contract prep, review, and negotiation guidance module.",
    price: 595,
    ghlProductId: "prod_offer_support",
    recommendedFor: ["subsonic", "supersonic", "hypersonic"],
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
  selectedUpgrades: string[];
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
};

export function PricingConsole() {
  const [wizard, setWizard] = useState<WizardState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedUpgradeRows = useMemo(
    () => upgrades.filter((u) => wizard.selectedUpgrades.includes(u.slug)),
    [wizard.selectedUpgrades],
  );
  const upgradesSubtotal = selectedUpgradeRows.reduce((sum, u) => sum + u.price, 0);

  function selectPlan(plan: Plan) {
    setWizard((prev) => ({
      ...prev,
      plan,
      step: 1,
      selectedUpgrades: [],
    }));
    document.getElementById("pricing-wizard")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  async function continueToCheckout() {
    if (!wizard.plan || !wizard.propertyType) return;
    setSubmitting(true);
    setError("");

    const payload = {
      source: "pricing-wizard",
      plan: {
        id: wizard.plan.id,
        name: wizard.plan.name,
        price: wizard.plan.price,
        closeFee: wizard.plan.closeFee,
      },
      contact: {
        fullName: wizard.fullName.trim(),
        email: wizard.email.trim(),
        phone: wizard.phone.trim(),
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

    const res = await fetch("/api/ghl/pricing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!res) {
      setSubmitting(false);
      setError("Network error while creating checkout.");
      return;
    }

    const data = (await res.json().catch(() => null)) as
      | { ok: boolean; checkoutUrl?: string; error?: string }
      | null;
    if (!res.ok || !data?.ok) {
      setSubmitting(false);
      setError(data?.error || "Could not create checkout.");
      return;
    }

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }

    setSubmitting(false);
    setError("Checkout URL is not configured yet.");
  }

  return (
    <div className="py-10 sm:py-14">
      <Container className="space-y-8 sm:space-y-10">
        <header className="cockpit-hud-frame p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
            <div className="font-mono text-xs tracking-[0.22em] text-cyan-300/80">
              LISTQIK PRICING CONSOLE
            </div>
            <div className="rounded border border-fuchsia-500/40 bg-fuchsia-950/30 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-fuchsia-200">
              TEXAS · LIVE
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-end">
            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                Pricing that keeps your equity in your hands.
              </h1>
              <p className="max-w-2xl text-sm text-muted sm:text-base">
                Select your speed tier, run property intake, choose upgrades, then continue to GHL
                store checkout.
              </p>
            </div>
            <div className="flex flex-wrap items-end justify-start gap-2 sm:gap-4 lg:justify-end">
              <CockpitGauge label="VALUE" sublabel="RPM" value={83} size="sm" accent="cyan" />
              <CockpitGauge label="SPEED" sublabel="RPM" value={91} size="sm" accent="amber" />
              <CockpitGauge label="COMPLIANCE" sublabel="RPM" value={88} size="sm" accent="magenta" />
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
                  ? "border-cyan-400/45 shadow-[0_0_28px_rgba(34,211,238,0.18)]"
                  : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-white/60">{plan.badge}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{plan.name}</h2>
                </div>
                {plan.highlight ? (
                  <span className="rounded-full border border-cyan-300/50 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
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

        <section id="pricing-wizard" className="glass-surface p-4 sm:p-6">
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
                        ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
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
                          ? "border-cyan-400/60 bg-cyan-500/10"
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
              <div className="grid gap-3 md:grid-cols-2">
                {upgrades.map((item) => {
                  const selected = wizard.selectedUpgrades.includes(item.slug);
                  const recommended = wizard.plan
                    ? item.recommendedFor.includes(wizard.plan.id)
                    : false;
                  return (
                    <div
                      key={item.slug}
                      className={[
                        "rounded-2xl border p-4",
                        selected ? "border-cyan-400/60 bg-cyan-500/10" : "border-white/10 bg-white/5",
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
                            <div className="text-[11px] text-cyan-300/90">Recommended</div>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleUpgrade(item.slug)}
                          className={selected ? "btn-secondary w-full" : "btn-primary w-full justify-center"}
                        >
                          {selected ? "Remove" : "Add to package"}
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
                  onClick={continueToCheckout}
                  disabled={submitting}
                >
                  {submitting ? "Creating checkout..." : "Continue to Checkout"}
                </button>
              </div>
            </div>
          ) : null}
        </section>
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
  type?: "text" | "email" | "tel";
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

