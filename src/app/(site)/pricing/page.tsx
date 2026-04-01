import type { Metadata } from "next";
import Link from "next/link";
import { CockpitGauge } from "@/components/cockpit-gauge";
import { Container } from "@/components/container";

type Plan = {
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
    name: "Subsonic",
    badge: "Basic · Close Air Support",
    price: "$99",
    closeFee: "0.50% at closing",
    listTerm: "6 months",
    photos: "Up to 25 photos",
    support: "7-day support (chat/email/phone)",
    included: [
      "MLS listing launch target within 24 hours of complete docs",
      "Distribution to major home-search portals",
      "Required listing forms and disclosure workflow",
      "Unlimited listing edits while active",
      "Your contact details shown in MLS where allowed",
      "Buyer inquiries routed to you",
      "You control buyer-agent concessions in negotiations",
      "Cancel anytime before pending status",
    ],
    optional: [
      "Showing scheduler module",
      "Yard sign kit",
      "Open house directional sign pack",
      "Single open house event push",
      "Virtual tour publishing add-on",
      "Transaction coordinator support",
      "Offer/counter prep and review",
      "Comparative market analysis (CMA)",
      "Professional photography add-on",
      "Additional MLS territory",
    ],
  },
  {
    name: "Supersonic",
    badge: "Premium · Sound Barrier",
    price: "$195",
    closeFee: "0.25% at closing",
    listTerm: "6 months",
    photos: "Max photos allowed by MLS",
    support: "7-day support (priority queue)",
    highlight: true,
    included: [
      "Everything in Starter Grid",
      "Lower compliance close-out fee",
      "Max-photo listing format for broader visual coverage",
      "Welcome onboarding call",
      "Automated valuation support where available",
    ],
    optional: [
      "Showing scheduler module",
      "Yard sign kit",
      "Open house directional sign pack",
      "Single open house event push",
      "Virtual tour publishing add-on",
      "Transaction coordinator support",
      "Offer/counter prep and review",
      "Comparative market analysis (CMA)",
      "Professional photography add-on",
      "Additional MLS territory",
    ],
  },
  {
    name: "Hypersonic",
    badge: "Luxury · Darkstar Class",
    price: "$395",
    closeFee: "0.25% at closing",
    listTerm: "12 months",
    photos: "Max photos allowed by MLS",
    support: "7-day support + enhanced setup",
    included: [
      "Everything in Signal Pro",
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

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare ListQik.com pricing tiers for Texas MLS listing services. Plans start at $99 with broker-backed compliance support.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
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
                Pick a launch tier, keep control of your sale workflow, and add support modules only
                when you need them.
              </p>
            </div>
            <div className="flex flex-wrap items-end justify-start gap-2 sm:gap-4 lg:justify-end">
              <CockpitGauge label="VALUE" sublabel="RPM" value={83} size="sm" accent="cyan" />
              <CockpitGauge label="SPEED" sublabel="RPM" value={91} size="sm" accent="amber" />
              <CockpitGauge
                label="COMPLIANCE"
                sublabel="RPM"
                value={88}
                size="sm"
                accent="magenta"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
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

                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-white/60">Optional add-ons</h3>
                  <ul className="mt-2 grid gap-2 text-white/75">
                    {plan.optional.map((item) => (
                      <li key={item} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/listings" className="btn-primary w-full justify-center">
                  Select {plan.name}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="glass-surface space-y-4 p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-white">Pricing notes</h2>
          <ul className="grid gap-2 text-sm text-white/80">
            <li>
              Closing compliance fee applies only when the property sells and supports state/MLS process
              requirements.
            </li>
            <li>
              Buyer-agent compensation is negotiable and set by the seller through the offer process.
            </li>
            <li>
              Feature availability can vary by MLS region. We confirm options during onboarding.
            </li>
          </ul>
        </section>
      </Container>
    </div>
  );
}

