import type { Metadata } from "next";
import Link from "next/link";
import { CockpitGauge } from "@/components/cockpit-gauge";
import { Container } from "@/components/container";
import { ComparisonTable } from "@/components/comparison-table";
import { ListingCard } from "@/components/listing-card";
import { NetProceedsCalculator } from "@/components/net-proceeds-calculator";
import { listings } from "@/data/listings";

export const metadata: Metadata = {
  title: "ListQik.com | Texas Home Listing Platform",
  description:
    "List your Texas home with a guided workflow, broker-backed support, and tools built to help you keep more equity.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const featured = listings.filter((l) => l.featured).slice(0, 3);
  const missionPanels = [
    {
      title: "Target Acquisition",
      description: "Start your listing with guided property intake and broker-backed workflow.",
      href: "/pricing",
    },
    {
      title: "Fuel System",
      description: "Run equity and fee checks before launch.",
      href: "/pricing",
    },
    {
      title: "Navigation System",
      description: "Track market context and active inventory.",
      href: "/listings",
    },
  ];
  const modules = [
    {
      title: "Rapid Deployment",
      description: "Launch listing workflows in hours, not days.",
    },
    {
      title: "Compliance Review",
      description: "Structured process with broker-backed oversight.",
    },
    {
      title: "Equity Focus",
      description: "Decision support tools designed to protect seller proceeds.",
    },
  ];

  return (
    <div className="relative min-w-0 overflow-x-hidden pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg" />

      <section className="cockpit-hero pt-6 sm:pt-10 lg:pt-14">
        <div aria-hidden className="cockpit-scanlines absolute inset-0 z-[1]" />
        <Container className="relative z-[2]">
          <div className="cockpit-hud-frame p-3 sm:p-5 lg:p-8">
            <div className="mb-4 flex flex-col items-center justify-center gap-2 border-b border-cyan-500/20 pb-3 font-mono text-[9px] tracking-[0.18em] text-cyan-300/80 sm:mb-6 sm:flex-row sm:justify-between sm:gap-3 sm:pb-4 sm:text-[11px] sm:tracking-[0.25em]">
              <span className="text-fuchsia-300/90">MFD · LISTQIK</span>
              <span className="text-amber-400/90">HUD · TX</span>
              <span className="text-emerald-400/80">SYS · NOM</span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-black/50 p-4 sm:p-6 lg:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.2),rgba(0,0,0,0.85)_65%)]"
              />
              <div className="relative mx-auto max-w-3xl text-center">
                <div className="inline-flex max-w-full items-center gap-2 rounded border border-fuchsia-500/40 bg-fuchsia-950/30 px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-[0.15em] text-fuchsia-200 sm:px-3 sm:text-[10px] sm:tracking-[0.2em]">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  COCKPIT MODE
                </div>
                <h1 className="mt-4 bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text font-mono text-2xl font-bold uppercase tracking-tight text-transparent max-sm:normal-case sm:text-4xl lg:text-5xl">
                  Pilot Your Listing
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/90 sm:text-base">
                  Deploy listings faster, retain more equity, and run a guided workflow through a
                  licensed brokerage.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="/pricing" className="btn-primary min-h-[48px] justify-center px-6">
                    Start Your Mission
                  </Link>
                  <Link href="/listings" className="btn-secondary min-h-[48px] justify-center px-6">
                    View Active Listings
                  </Link>
                </div>
              </div>

              <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {missionPanels.map((panel) => (
                  <Link
                    key={panel.title}
                    href={panel.href}
                    className="group rounded-2xl border border-cyan-400/35 bg-black/60 p-4 transition duration-200 hover:scale-[1.02] hover:border-cyan-300/60 hover:bg-cyan-950/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  >
                    <h3 className="text-sm font-semibold tracking-wide text-cyan-200 sm:text-base">
                      {panel.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/75">{panel.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative mt-6 grid min-w-0 gap-4 overflow-hidden rounded-2xl border border-cyan-500/20 p-3 sm:gap-5 sm:p-4 lg:gap-6 lg:p-5">
              <div
                aria-hidden
                className="absolute inset-0 bg-[url('/cockpit-homepage.webp')] bg-cover bg-center opacity-60"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/25"
              />

              <div className="relative w-full min-w-0 overflow-hidden rounded-xl border border-cyan-500/20 bg-black/35">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent"
                />

                <div className="relative flex w-full flex-col items-center gap-5 p-3 pt-5 sm:p-4 md:grid md:grid-cols-3 md:items-end md:justify-items-center md:gap-6 lg:p-6">
                  <div className="origin-top scale-95">
                    <CockpitGauge label="DEPLOY" sublabel="RPM" value={88} size="sm" accent="amber" />
                  </div>
                  <div className="origin-top scale-[0.78] min-[400px]:scale-[0.88] sm:scale-95 lg:scale-100">
                    <CockpitGauge label="CONTRACTS" sublabel="RPM" value={72} size="lg" accent="cyan" />
                  </div>
                  <div className="origin-top scale-95">
                    <CockpitGauge label="EQUITY" sublabel="RPM" value={64} size="sm" accent="magenta" />
                  </div>
                </div>
              </div>

              <div className="w-full lg:grid lg:grid-cols-5">
                <div className="cockpit-mfd-wrap relative min-w-0 bg-slate-950/65 p-0.5 sm:p-1 lg:col-span-3 lg:col-start-2">
                  <NetProceedsCalculator />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pt-8 sm:pt-10 lg:pt-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {modules.map((module) => (
              <article key={module.title} className="glass-surface rounded-2xl p-5">
                <h3 className="text-base font-semibold text-cyan-200">{module.title}</h3>
                <p className="mt-2 text-sm text-white/75">{module.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="pt-8 sm:pt-10 lg:pt-14">
        <Container>
          <div className="glass-surface rounded-2xl p-6 text-center sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Mission Stats</h2>
            <div className="mt-6 grid gap-4 text-cyan-200 sm:grid-cols-3 sm:gap-6">
              <div className="rounded-xl border border-cyan-400/30 bg-black/35 px-4 py-5">
                <p className="text-3xl font-bold">72</p>
                <p className="mt-1 text-xs tracking-wider text-white/65">RAPID DEPLOYMENTS</p>
              </div>
              <div className="rounded-xl border border-cyan-400/30 bg-black/35 px-4 py-5">
                <p className="text-3xl font-bold">64%</p>
                <p className="mt-1 text-xs tracking-wider text-white/65">EQUITY RETENTION INDEX</p>
              </div>
              <div className="rounded-xl border border-cyan-400/30 bg-black/35 px-4 py-5">
                <p className="text-3xl font-bold">100+</p>
                <p className="mt-1 text-xs tracking-wider text-white/65">ACTIVE LISTINGS</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/pricing" className="btn-primary min-h-[48px] justify-center px-8">
                Launch Platform
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="pt-8 sm:pt-10 lg:pt-14">
        <Container>
          <ComparisonTable />
        </Container>
      </section>

      <section className="pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pb-24">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-widest text-white/60">
                FEATURED LISTINGS
              </div>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-2xl">
                Real inventory. Clean specs.
              </h2>
              <p className="mt-2 text-sm text-muted">
                Browse listings, filter locally, and drill into slug-based detail pages.
              </p>
            </div>
            <Link href="/listings" className="btn-secondary hidden shrink-0 sm:inline-flex">
              Open listings →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.slug} listing={l} />
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link href="/listings" className="btn-secondary w-full">
              Open listings →
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}

