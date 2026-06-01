import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { LocationSeoCta } from "@/components/service-area/location-seo-cta";
import { LocationSeoJsonLd } from "@/components/service-area/location-seo-json-ld";
import {
  countyPagePath,
  TEXAS_COUNTIES,
  TEXAS_LOCATION_STATS,
} from "@/lib/texas-location-seo";

export const metadata: Metadata = {
  title: "Texas Counties & Cities | ListQik Service Area",
  description:
    "Browse every Texas county and city ListQik supports for home listing SEO. Find your county or city page for broker-backed MLS listing information and pricing.",
  alternates: { canonical: "/service-area/texas" },
};

export default function TexasServiceAreaIndexPage() {
  const byLetter = new Map<string, typeof TEXAS_COUNTIES>();
  for (const county of TEXAS_COUNTIES) {
    const letter = county.county[0]?.toUpperCase() ?? "#";
    const bucket = byLetter.get(letter) ?? [];
    bucket.push(county);
    byLetter.set(letter, bucket);
  }

  const letters = [...byLetter.keys()].sort();

  return (
    <div className="py-10 sm:py-14">
      <LocationSeoJsonLd
        pageTitle="Texas Counties & Cities | ListQik Service Area"
        pageDescription={metadata.description as string}
        canonicalPath="/service-area/texas"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Service Area", path: "/service-area" },
          { name: "Texas", path: "/service-area/texas" },
        ]}
      />
      <Container>
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-white/60">TEXAS LOCATION INDEX</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Every Texas county and city
            </h1>
            <p className="max-w-3xl text-base text-muted">
              This index helps search engines and Google Ads connect ListQik to local Texas markets.
              Each county and city has its own page with listing-focused information—without cluttering
              the main service area map.
            </p>
            <p className="text-sm text-white/55">
              {TEXAS_LOCATION_STATS.countyCount} counties · {TEXAS_LOCATION_STATS.cityCount} cities
            </p>
            <LocationSeoCta />
          </header>

          <div className="space-y-8">
            {letters.map((letter) => (
              <section key={letter} className="glass-surface rounded-2xl border border-white/10 p-5">
                <h2 className="text-lg font-semibold text-emerald-100">{letter}</h2>
                <ul className="mt-4 columns-2 gap-x-6 text-sm sm:columns-3 lg:columns-4">
                  {(byLetter.get(letter) ?? []).map((county) => (
                    <li key={county.countySlug} className="mb-2 break-inside-avoid">
                      <Link
                        href={countyPagePath(county.countySlug)}
                        className="text-emerald-200 underline-offset-2 hover:underline"
                      >
                        {county.county} County
                      </Link>
                      <span className="text-white/40"> · {county.cities.length} cities</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
