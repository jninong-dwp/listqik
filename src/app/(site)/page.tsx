import Link from "next/link";
import { Container } from "@/components/container";
import { ComparisonTable } from "@/components/comparison-table";
import { ListingCard } from "@/components/listing-card";
import { NetProceedsCalculator } from "@/components/net-proceeds-calculator";
import { listings } from "@/data/listings";

export default function HomePage() {
  const featured = listings.filter((l) => l.featured).slice(0, 3);

  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg" />

      <section className="pt-10 sm:pt-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-white/70">
                <span className="h-2 w-2 rounded-full bg-[color:var(--lp-accent)] shadow-[0_0_18px_rgba(68,255,154,0.45)]" />
                FSBO FINTECH · TEXAS
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Deploy your listing like a technical utility.
              </h1>
              <p className="text-base text-muted sm:text-lg">
                Controller-grade workflow, broker-backed compliance, and rapid deployment.
                Keep more equity. Reduce friction. Ship the listing.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/listings" className="btn-primary">
                  Deploy Listing
                </Link>
                <Link href="/about" className="btn-secondary">
                  Read the system spec
                </Link>
              </div>

              <div className="glass-surface p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat label="Rapid deployment" value="4 hours" />
                  <Stat label="Local TX broker support" value="Included" />
                  <Stat label="AI compliance audit" value="Ready" />
                </div>
              </div>
            </div>

            <NetProceedsCalculator />
          </div>
        </Container>
      </section>

      <section className="pt-10 sm:pt-14">
        <Container>
          <ComparisonTable />
        </Container>
      </section>

      <section className="pt-10 pb-16 sm:pt-14 sm:pb-24">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-semibold tracking-widest text-white/60">
                FEATURED LISTINGS
              </div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Real inventory. Clean specs.
              </h2>
              <p className="mt-2 text-sm text-muted">
                Browse listings, filter locally, and drill into slug-based detail pages.
              </p>
            </div>
            <Link href="/listings" className="btn-secondary hidden sm:inline-flex">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-mono text-white/50">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

