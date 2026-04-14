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

            <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
              <div className="min-w-0 space-y-4 sm:space-y-6">
                <div className="inline-flex max-w-full items-center gap-2 rounded border border-fuchsia-500/40 bg-fuchsia-950/30 px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-[0.15em] text-fuchsia-200 sm:px-3 sm:text-[10px] sm:tracking-[0.2em]">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                  COCKPIT MODE
                </div>

                <h1 className="bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text font-mono text-lg font-bold uppercase leading-snug tracking-tight text-transparent max-sm:normal-case sm:text-3xl lg:text-4xl">
                  List your home — clear steps, fast support.
                </h1>
                <p className="max-w-xl font-mono text-[13px] leading-relaxed text-slate-300/90 sm:text-base">
                  Texas-focused workflow: list through a licensed brokerage with guided marketing and
                  compliance support.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href="/pricing" className="btn-primary min-h-[48px] w-full justify-center sm:w-auto sm:min-h-0">
                    Start Listing
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-950/20 px-5 py-3 text-sm font-semibold tracking-wide text-cyan-100 transition hover:border-cyan-400/50 hover:bg-cyan-950/40 sm:min-h-0 sm:w-auto"
                  >
                    Read the system spec
                  </Link>
                </div>

                <div className="flex w-full min-w-0 flex-col items-center gap-5 border-t border-cyan-500/15 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pt-6">
                  <div className="flex w-full min-w-0 justify-center sm:w-auto sm:justify-start">
                    <div className="origin-top scale-[0.82] sm:scale-100">
                      <CockpitGauge
                        label="CONTRACTS"
                        sublabel="RPM"
                        value={72}
                        size="lg"
                        accent="cyan"
                      />
                    </div>
                  </div>
                  <div className="flex w-full min-w-0 shrink-0 items-end justify-center gap-3 sm:w-auto sm:gap-6">
                    <CockpitGauge
                      label="DEPLOY"
                      sublabel="RPM"
                      value={88}
                      size="sm"
                      accent="amber"
                    />
                    <CockpitGauge
                      label="EQUITY"
                      sublabel="RPM"
                      value={64}
                      size="sm"
                      accent="magenta"
                    />
                  </div>
                </div>
              </div>

              <div className="cockpit-mfd-wrap min-w-0 bg-slate-950/40 p-0.5 sm:p-1">
                <NetProceedsCalculator />
              </div>
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

