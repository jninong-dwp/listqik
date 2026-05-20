"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  shouldOpenSubsonicIntakeFromSearchParams,
  START_NOW_SUBSONIC_PROMO,
} from "@/lib/stripe-subsonic-landing-promo";
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
import { PricingLanguageToggle } from "@/components/pricing/pricing-language-toggle";
import { useSiteLocale } from "@/components/site-locale-provider";
import {
  getPricingCopy,
  type PricingPlan,
  type PricingPropertyTypeId,
} from "@/i18n/pricing-copy";

type WizardState = {
  step: 1 | 2 | 3;
  plan: PricingPlan | null;
  propertyAddress: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  fullName: string;
  email: string;
  phone: string;
  propertyType: PricingPropertyTypeId | "";
  acceptedUserAgreement: boolean;
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
  acceptedUserAgreement: false,
};

export function PricingConsole() {
  const searchParams = useSearchParams();
  const { locale, ready } = useSiteLocale();
  const copy = useMemo(() => getPricingCopy(locale), [locale]);
  const plans = copy.plans;
  const propertyTypes = copy.propertyTypes;
  const autoOpenSubsonicIntake = shouldOpenSubsonicIntakeFromSearchParams(searchParams);
  const landingPromoHandled = useRef(false);
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""),
    [],
  );
  const [wizard, setWizard] = useState<WizardState>(initialState);
  const [landingPromoSource, setLandingPromoSource] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const submitting = false;
  const [error, setError] = useState("");
  const [planCheckoutLoading, setPlanCheckoutLoading] = useState(false);
  const [planCheckoutUrl, setPlanCheckoutUrl] = useState<string | null>(null);
  const [planCheckoutClientSecret, setPlanCheckoutClientSecret] = useState<string | null>(null);
  const [, setCheckingPlanPayment] = useState(false);
  const [planPaymentRecorded, setPlanPaymentRecorded] = useState(false);
  const [, setPlanAutoAdvanced] = useState(false);
  const [handoffBusy, setHandoffBusy] = useState<"listing-setup" | "upgrades" | null>(null);

  const advanceToUpgradesIfReady = useCallback(() => {
    setPlanAutoAdvanced((alreadyAdvanced) => {
      if (alreadyAdvanced) return alreadyAdvanced;
      setWizard((current) => (current.step === 2 ? { ...current, step: 3 } : current));
      return true;
    });
  }, []);

  const selectPlan = useCallback((plan: PricingPlan) => {
    const nextSessionId =
      typeof window !== "undefined" && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setWizard((prev) => ({
      ...prev,
      plan,
      step: 1,
      acceptedUserAgreement: false,
    }));
    setCheckoutSessionId(nextSessionId);
    setPlanCheckoutUrl(null);
    setPlanCheckoutClientSecret(null);
    setPlanPaymentRecorded(false);
    setPlanAutoAdvanced(false);
    setError("");
    setIsWizardOpen(true);
  }, []);

  useLayoutEffect(() => {
    if (!autoOpenSubsonicIntake || landingPromoHandled.current) return;
    const subsonic = copy.plans.find((p) => p.id === "subsonic");
    if (!subsonic) return;
    landingPromoHandled.current = true;
    setLandingPromoSource(START_NOW_SUBSONIC_PROMO);
    selectPlan({ ...subsonic, price: copy.subsonicPromoPrice });
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      const addressInput = document.getElementById("wizard-property-address");
      if (addressInput instanceof HTMLInputElement) {
        addressInput.focus();
      }
    });
  }, [autoOpenSubsonicIntake, selectPlan, copy]);

  useEffect(() => {
    setWizard((s) => {
      if (!s.plan) return s;
      const updated = copy.plans.find((p) => p.id === s.plan!.id);
      if (!updated) return s;
      const price =
        updated.id === "subsonic" && landingPromoSource
          ? copy.subsonicPromoPrice
          : updated.price;
      return { ...s, plan: { ...updated, price } };
    });
  }, [locale, copy, landingPromoSource]);

  function closeWizard() {
    if (submitting) return;
    setIsWizardOpen(false);
    setWizard((s) => ({ ...s, acceptedUserAgreement: false }));
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
      wizard.phone.trim().length >= 7 &&
      wizard.acceptedUserAgreement
    );
  }

  const checkCheckoutStatus = useCallback(async () => {
    if (!checkoutSessionId) return null;
    const res = await fetch(`/api/pricing/checkout/status?sessionId=${encodeURIComponent(checkoutSessionId)}`, {
      cache: "no-store",
    }).catch(() => null);
    if (!res) {
      setError(copy.errors.paymentStatusConnection);
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
      setError(data?.error || copy.errors.paymentStatus);
      return null;
    }
    setPlanPaymentRecorded(Boolean(data.planPaid));
    if (data.planPaid) {
      setError("");
      advanceToUpgradesIfReady();
    }
    return data;
  }, [checkoutSessionId, advanceToUpgradesIfReady, copy.errors]);

  const checkPlanPaymentStatus = useCallback(async (showPendingError = false) => {
    if (!checkoutSessionId) return false;
    setCheckingPlanPayment(true);
    const data = await checkCheckoutStatus();
    setCheckingPlanPayment(false);
    if (!data) return false;
    if (!data.planPaid) {
      if (showPendingError) {
        setError(copy.errors.paymentPending);
      }
      return false;
    }
    setError("");
    return true;
  }, [checkoutSessionId, checkCheckoutStatus, copy.errors.paymentPending]);

  const handleEmbeddedCheckoutComplete = useCallback(() => {
    // Stripe reports completion in the embedded frame; advance UX immediately.
    setPlanPaymentRecorded(true);
    advanceToUpgradesIfReady();
    // Keep server-side confirmation in the background for resiliency.
    void checkPlanPaymentStatus(false);
  }, [advanceToUpgradesIfReady, checkPlanPaymentStatus]);

  async function continueAfterPayment(destination: "listing-setup" | "upgrades") {
    if (!checkoutSessionId) {
      setError(copy.errors.sessionNotFound);
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
        setError(data?.error || copy.errors.continueFailed);
        return;
      }
      window.location.href = data.nextUrl;
    } catch {
      setError(copy.errors.networkHandoff);
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
      setError(copy.errors.checkoutInit);
      return;
    }
    const res = await fetch("/api/stripe/pricing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        checkoutSessionId,
        checkoutKind: "plan",
        source: "pricing-console",
        promoSource: landingPromoSource ?? undefined,
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
      setError(copy.errors.stripeCreate);
      return;
    }
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; checkoutUrl?: string | null; checkoutClientSecret?: string | null; error?: string }
      | null;
    if (!res.ok || !data?.ok || (!data.checkoutClientSecret && !data.checkoutUrl)) {
      setError(data?.error || copy.errors.stripeUrlMissing);
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

  const landingIntakeActive = isWizardOpen && landingPromoSource === START_NOW_SUBSONIC_PROMO;

  return (
    <div
      className={[
        "py-10 transition-opacity duration-200 sm:py-14",
        ready ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <Container className="space-y-8 sm:space-y-10">
        <div className={landingIntakeActive ? "sr-only" : undefined} aria-hidden={landingIntakeActive}>
        <header className="cockpit-hud-frame p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
            <div className="font-mono text-xs tracking-[0.22em] text-emerald-300/80">
              {copy.hud.console}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PricingLanguageToggle />
              <div className="rounded border border-amber-300/70 bg-amber-500/20 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.35)]">
                {copy.hud.live}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-end">
            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-lime-200 via-emerald-100 to-emerald-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                {copy.header.title}
              </h1>
              <p className="max-w-2xl text-sm text-muted sm:text-base">
                {copy.header.body}
              </p>
            </div>
            <div className="flex flex-wrap items-end justify-start gap-2 sm:gap-4 lg:justify-end">
              <CockpitGauge
                label={copy.gauges.value}
                sublabel={copy.gauges.rpm}
                value={83}
                size="sm"
                accent="emerald"
              />
              <CockpitGauge
                label={copy.gauges.speed}
                sublabel={copy.gauges.rpm}
                value={91}
                size="sm"
                accent="emerald"
              />
              <CockpitGauge
                label={copy.gauges.compliance}
                sublabel={copy.gauges.rpm}
                value={88}
                size="sm"
                accent="emerald"
              />
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
            {plans.map((plan) => {
              const displayPrice =
                plan.id === "subsonic" && autoOpenSubsonicIntake
                  ? copy.subsonicPromoPrice
                  : plan.price;
              return (
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
                      {copy.planCard.recommended}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 min-h-[206px] rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="font-mono text-3xl font-bold text-white">{displayPrice}</div>
                  <div className="mt-1 text-sm text-white/75">{plan.closeFee}</div>
                  <dl className="mt-4 grid gap-2 text-sm text-white/80">
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/60">{copy.planCard.listingTerm}</dt>
                      <dd>{plan.listTerm}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/60">{copy.planCard.photos}</dt>
                      <dd>{plan.photos}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-white/60">{copy.planCard.support}</dt>
                      <dd className="text-right">{plan.support}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      selectPlan(
                        plan.id === "subsonic" && autoOpenSubsonicIntake
                          ? { ...plan, price: copy.subsonicPromoPrice }
                          : plan,
                      )
                    }
                    className="btn-primary w-full justify-center"
                  >
                    {copy.planCard.selectPlan} {plan.name}
                  </button>
                </div>

                <div className="mt-5 grid gap-4 text-sm">
                  <div>
                    <h3 className="text-xs font-semibold tracking-widest text-white/60">
                      {copy.planCard.included}
                    </h3>
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
              );
            })}
          </section>
        </div>

        <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 text-sm text-emerald-100/90">
          {copy.disclaimer}
        </section>
        </div>

        {isWizardOpen ? (
          <div
            className="fixed inset-0 z-50 grid place-items-end bg-slate-950/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={copy.wizard.dialogLabel}
          >
            <section className="glass-surface h-[92vh] w-full overflow-y-auto rounded-t-2xl p-4 sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold tracking-widest text-white/70">
                  {copy.wizard.intakeLabel}
                </div>
                <button
                  type="button"
                  onClick={closeWizard}
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  {copy.wizard.close}
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
              {copy.wizard.selectedPackage}{" "}
              <span className="font-semibold text-white">{wizard.plan.name}</span> ({wizard.plan.price})
            </div>
          ) : (
            <div className="mb-4 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white/70">
              {copy.wizard.selectPlanHint}
            </div>
          )}

          {wizard.step === 1 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">{copy.wizard.step1Title}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <AddressAutocompleteInput
                  id="wizard-property-address"
                  label={copy.wizard.propertyAddress}
                  value={wizard.propertyAddress}
                  onChange={(v) => setWizard((s) => ({ ...s, propertyAddress: v }))}
                  onPlaceSelected={onAddressPlaceSelected}
                />
                <Input
                  label={copy.wizard.unit}
                  value={wizard.unit}
                  onChange={(v) => setWizard((s) => ({ ...s, unit: v }))}
                />
                <Input
                  label={copy.wizard.city}
                  value={wizard.city}
                  onChange={(v) => setWizard((s) => ({ ...s, city: v }))}
                />
                <Input
                  label={copy.wizard.state}
                  value={wizard.state}
                  onChange={(v) => setWizard((s) => ({ ...s, state: v }))}
                />
                <Input
                  label={copy.wizard.zip}
                  value={wizard.zip}
                  onChange={(v) => setWizard((s) => ({ ...s, zip: v }))}
                />
                <Input
                  label={copy.wizard.county}
                  value={wizard.county}
                  onChange={(v) => setWizard((s) => ({ ...s, county: v }))}
                />
              </div>
              <label className="grid w-full gap-1.5">
                <span className="text-xs font-semibold tracking-widest text-white/60">
                  {copy.wizard.propertyType}
                </span>
                <select
                  value={wizard.propertyType}
                  onChange={(e) =>
                    setWizard((s) => ({
                      ...s,
                      propertyType: (e.target.value || "") as PricingPropertyTypeId | "",
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                >
                  <option value="" className="bg-slate-900">
                    {copy.wizard.propertyTypePlaceholder}
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
                  label={copy.wizard.fullName}
                  value={wizard.fullName}
                  onChange={(v) => setWizard((s) => ({ ...s, fullName: v }))}
                />
                <Input
                  label={copy.wizard.email}
                  value={wizard.email}
                  onChange={(v) => setWizard((s) => ({ ...s, email: v }))}
                  type="email"
                />
                <Input
                  label={copy.wizard.phone}
                  value={wizard.phone}
                  onChange={(v) => setWizard((s) => ({ ...s, phone: v }))}
                  type="tel"
                />
              </div>
              <label className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                <input
                  type="checkbox"
                  checked={wizard.acceptedUserAgreement}
                  onChange={(e) =>
                    setWizard((s) => ({ ...s, acceptedUserAgreement: e.target.checked }))
                  }
                  className="mt-1 accent-emerald-400"
                />
                <span>
                  {copy.wizard.termsPrefix}{" "}
                  <Link href="/resources/legal/terms" className="font-semibold text-emerald-300 underline-offset-2 hover:underline">
                    {copy.wizard.termsLink}
                  </Link>{" "}
                  {copy.wizard.termsSuffix}
                </span>
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!canContinueToUpgrades() || planCheckoutLoading}
                  onClick={() => {
                    void openPlanCheckoutStep();
                  }}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {planCheckoutLoading ? copy.wizard.preparingCheckout : copy.wizard.nextCheckout}
                </button>
              </div>
            </div>
          ) : null}

          {wizard.step === 2 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">{copy.wizard.step2Title}</h2>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/85">
                <p className="font-semibold text-white">{copy.wizard.orderSummary}</p>
                <ul className="mt-3 grid gap-2">
                  <li className="flex justify-between gap-3">
                    <span className="text-white/65">{copy.wizard.planLabel}</span>
                    <span>
                      {wizard.plan?.name} — {wizard.plan?.price}
                    </span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span className="text-white/65">{copy.wizard.propertyLabel}</span>
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
                      {copy.wizard.stripeHostedHint}
                    </p>
                    <a
                      href={planCheckoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary inline-flex"
                    >
                      {copy.wizard.openStripeCheckout}
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-sm text-white/70">
                    {planCheckoutLoading
                      ? copy.wizard.checkoutPreparing
                      : copy.wizard.checkoutNotReady}
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
                  {copy.wizard.back}
                </button>
              </div>
            </div>
          ) : null}
          {wizard.step === 3 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-white">{copy.wizard.step3Title}</h2>
              <div className="rounded-2xl border border-emerald-400/35 bg-emerald-950/20 p-4 text-sm text-emerald-100/90">
                <p className="font-semibold text-emerald-100">{copy.wizard.successTitle}</p>
                <p className="mt-2">{copy.wizard.successBody}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/85">
                <p>
                  {copy.wizard.selectedPlan}{" "}
                  <span className="font-semibold text-white">{wizard.plan?.name}</span>
                </p>
                <p className="mt-1">
                  {copy.wizard.propertyLine} {wizard.propertyAddress}
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
                  {copy.wizard.back}
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
                    {handoffBusy === "upgrades" ? copy.wizard.preparing : copy.wizard.addUpgrades}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void continueAfterPayment("listing-setup");
                    }}
                    disabled={handoffBusy !== null}
                    className="btn-primary disabled:opacity-50"
                  >
                    {handoffBusy === "listing-setup"
                      ? copy.wizard.preparing
                      : copy.wizard.continueListingSetup}
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

