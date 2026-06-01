import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { LocationSeoCta } from "@/components/service-area/location-seo-cta";
import { LocationSeoJsonLd } from "@/components/service-area/location-seo-json-ld";
import {
  allCountyStaticParams,
  cityPagePath,
  countyCoverageTier,
  countyPagePath,
  countySeoDescription,
  countySeoTitle,
  coverageLabel,
  getCountyBySlug,
  isActiveListQikCounty,
} from "@/lib/texas-location-seo";

export function generateStaticParams() {
  return allCountyStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countySlug: string }>;
}): Promise<Metadata> {
  const { countySlug } = await params;
  const county = getCountyBySlug(countySlug);
  if (!county) return {};

  const tier = countyCoverageTier(county.county);
  const title = countySeoTitle(county.county);
  const description = countySeoDescription(county.county, tier, county.cities.length);

  return {
    title,
    description,
    alternates: { canonical: countyPagePath(countySlug) },
    openGraph: { title, description },
  };
}

export default async function TexasCountySeoPage({
  params,
}: {
  params: Promise<{ countySlug: string }>;
}) {
  const { countySlug } = await params;
  const county = getCountyBySlug(countySlug);
  if (!county) notFound();

  const tier = countyCoverageTier(county.county);
  const active = isActiveListQikCounty(county.county);
  const title = countySeoTitle(county.county);
  const description = countySeoDescription(county.county, tier, county.cities.length);
  const path = countyPagePath(countySlug);

  return (
    <div className="py-10 sm:py-14">
      <LocationSeoJsonLd
        pageTitle={title}
        pageDescription={description}
        canonicalPath={path}
        countyName={county.county}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Service Area", path: "/service-area" },
          { name: "Texas", path: "/service-area/texas" },
          { name: `${county.county} County`, path },
        ]}
      />
      <Container>
        <article className="mx-auto max-w-3xl space-y-6">
          <header className="space-y-3">
            <p className="text-xs font-semibold tracking-widest text-emerald-200/80">
              {coverageLabel(tier).toUpperCase()}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Home listings in {county.county} County, Texas
            </h1>
            <p className="text-base text-muted">{description}</p>
          </header>

          <section className="glass-surface space-y-3 rounded-2xl border border-white/10 p-5 text-sm text-white/75">
            <h2 className="text-base font-semibold text-white">Coverage for {county.county} County</h2>
            {active ? (
              <p>
                {county.county} County is part of ListQik&apos;s published Texas service footprint. Sellers
                can start intake online, compare plan pricing, and work with licensed brokerage support for
                MLS submission.
              </p>
            ) : (
              <p>
                ListQik provides Texas-wide seller resources for {county.county} County. Contact concierge
                to confirm broker availability, MLS path, and timing for your property address.
              </p>
            )}
            <p>
              Looking for a specific town? Choose a city below or go to{" "}
              <Link href="/pricing" className="text-emerald-300 underline">
                pricing
              </Link>{" "}
              to begin.
            </p>
          </section>

          {county.cities.length > 0 ? (
            <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <h2 className="text-base font-semibold text-white">
                Cities and communities in {county.county} County
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {county.cities.length} locations with dedicated ListQik pages for local search and ads.
              </p>
              <ul className="mt-4 columns-1 gap-x-6 text-sm sm:columns-2">
                {county.cities.map((city) => (
                  <li key={city.slug} className="mb-2 break-inside-avoid">
                    <Link
                      href={cityPagePath(county.countySlug, city.slug)}
                      className="text-emerald-200 underline-offset-2 hover:underline"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <LocationSeoCta />
        </article>
      </Container>
    </div>
  );
}
