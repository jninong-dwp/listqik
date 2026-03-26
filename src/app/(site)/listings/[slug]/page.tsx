import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { listings } from "@/data/listings";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function generateStaticParams() {
  return listings.map((l) => ({ slug: l.slug }));
}

export default async function ListingDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const listing = listings.find((l) => l.slug === slug);
  if (!listing) return notFound();

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-8 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-3">
            <div className="glass-surface overflow-hidden">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={listing.heroImage.src}
                  alt={listing.heroImage.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span className="chip">{listing.status.toUpperCase()}</span>
                  <span className="chip">{listing.type.replace("-", " ")}</span>
                  {listing.tags.slice(0, 2).map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {listing.title}
                </h1>
                <p className="mt-2 text-sm text-muted">
                  {listing.city}, {listing.state}
                  {listing.neighborhood ? ` · ${listing.neighborhood}` : ""}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Kpi label="Price" value={formatMoney(listing.price)} />
                  <Kpi
                    label="Beds / Baths"
                    value={`${listing.beds ?? "—"} / ${listing.baths ?? "—"}`}
                  />
                  <Kpi
                    label="Sqft"
                    value={listing.sqft ? listing.sqft.toLocaleString() : "—"}
                  />
                </div>

                <div className="mt-6 space-y-2">
                  <div className="text-xs font-semibold tracking-widest text-white/60">
                    SUMMARY
                  </div>
                  <p className="text-sm text-white/80">{listing.summary}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-2 space-y-6">
            <div className="glass-surface p-6">
              <div className="text-xs font-semibold tracking-widest text-white/60">
                DEPLOYMENT PANEL
              </div>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Rapid listing workflow
              </h2>
              <ul className="mt-4 grid gap-3 text-sm text-white/80">
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Asset intake</div>
                  <div className="mt-1 text-muted">
                    Photos, disclosures, and specs parsed into a deploy checklist.
                  </div>
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">AI compliance audit</div>
                  <div className="mt-1 text-muted">
                    Phase-ready hook for TREC disclosure review + broker validation.
                  </div>
                </li>
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold text-white">Telemetry</div>
                  <div className="mt-1 text-muted">
                    Events-ready for pixels, UTMs, and attribution reporting.
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass-surface p-6">
              <div className="text-xs font-semibold tracking-widest text-white/60">
                NOTE
              </div>
              <p className="mt-2 text-sm text-muted">
                This detail page is rendered from typed local data. Swap the
                datasource later (CMS/DB) without changing the route shape:
                <span className="font-mono text-white/70"> /listings/[slug]</span>.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-mono text-white/50">{label}</div>
      <div className="mt-1 text-base font-semibold text-white">{value}</div>
    </div>
  );
}

