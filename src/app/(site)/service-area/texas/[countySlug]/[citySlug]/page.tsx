import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { LocationSeoCta } from "@/components/service-area/location-seo-cta";
import { LocationSeoJsonLd } from "@/components/service-area/location-seo-json-ld";
import {
  allCityStaticParams,
  cityPagePath,
  citySeoDescription,
  citySeoTitle,
  countyCoverageTier,
  countyPagePath,
  coverageLabel,
  getCityBySlugs,
  isActiveListQikCounty,
} from "@/lib/texas-location-seo";

export function generateStaticParams() {
  return allCityStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countySlug: string; citySlug: string }>;
}): Promise<Metadata> {
  const { countySlug, citySlug } = await params;
  const match = getCityBySlugs(countySlug, citySlug);
  if (!match) return {};

  const tier = countyCoverageTier(match.county.county);
  const title = citySeoTitle(match.city.name, match.county.county);
  const description = citySeoDescription(match.city.name, match.county.county, tier);

  return {
    title,
    description,
    alternates: { canonical: cityPagePath(countySlug, citySlug) },
    openGraph: { title, description },
  };
}

export default async function TexasCitySeoPage({
  params,
}: {
  params: Promise<{ countySlug: string; citySlug: string }>;
}) {
  const { countySlug, citySlug } = await params;
  const match = getCityBySlugs(countySlug, citySlug);
  if (!match) notFound();

  const { county, city } = match;
  const tier = countyCoverageTier(county.county);
  const active = isActiveListQikCounty(county.county);
  const title = citySeoTitle(city.name, county.county);
  const description = citySeoDescription(city.name, county.county, tier);
  const path = cityPagePath(countySlug, citySlug);

  return (
    <div className="py-10 sm:py-14">
      <LocationSeoJsonLd
        pageTitle={title}
        pageDescription={description}
        canonicalPath={path}
        countyName={county.county}
        cityName={city.name}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Service Area", path: "/service-area" },
          { name: "Texas", path: "/service-area/texas" },
          { name: `${county.county} County`, path: countyPagePath(countySlug) },
          { name: city.name, path },
        ]}
      />
      <Container>
        <article className="mx-auto max-w-3xl space-y-6">
          <header className="space-y-3">
            <p className="text-xs font-semibold tracking-widest text-emerald-200/80">
              {coverageLabel(tier).toUpperCase()} · {county.county} County
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              List your home in {city.name}, Texas
            </h1>
            <p className="text-base text-muted">{description}</p>
          </header>

          <section className="glass-surface space-y-3 rounded-2xl border border-white/10 p-5 text-sm text-white/75">
            <h2 className="text-base font-semibold text-white">
              Seller support in {city.name}, {county.county} County
            </h2>
            {active ? (
              <p>
                ListQik supports sellers in {city.name} with online plan selection, property intake, and
                broker-backed MLS listing workflows for Texas homes.
              </p>
            ) : (
              <p>
                ListQik offers Texas seller tools for {city.name}. We can help confirm whether your address
                falls within current broker and MLS coverage before you start checkout.
              </p>
            )}
            <p>
              View the{" "}
              <Link href={countyPagePath(countySlug)} className="text-emerald-300 underline">
                {county.county} County
              </Link>{" "}
              page for other communities in this county.
            </p>
          </section>

          <LocationSeoCta />
        </article>
      </Container>
    </div>
  );
}
