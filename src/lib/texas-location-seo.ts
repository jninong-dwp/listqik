import texasLocations from "@/data/texas-locations.json";
import {
  ALL_SERVICE_COUNTIES,
  EXTENDED_SERVICE_COUNTIES,
  PRIMARY_SERVICE_COUNTIES,
} from "@/lib/service-area";

export type TexasLocationCounty = (typeof texasLocations.locations)[number];
export type TexasLocationCity = TexasLocationCounty["cities"][number];

export type ServiceCoverageTier =
  | "primary"
  | "extended"
  | "har-core"
  | "har-extended"
  | "statewide";

const HAR_CORE = new Set([
  "Harris",
  "Fort Bend",
  "Montgomery",
  "Brazoria",
  "Galveston",
  "Liberty",
  "Waller",
  "Chambers",
  "Austin",
]);

const HAR_EXTENDED = new Set([
  "Walker",
  "San Jacinto",
  "Wharton",
  "Colorado",
  "Matagorda",
  "Grimes",
  "Washington",
]);

const PRIMARY = new Set<string>(PRIMARY_SERVICE_COUNTIES);
const EXTENDED = new Set<string>(EXTENDED_SERVICE_COUNTIES);
const ACTIVE = new Set<string>(ALL_SERVICE_COUNTIES);

export const TEXAS_LOCATION_DATA = texasLocations;
export const TEXAS_COUNTIES = texasLocations.locations;
export const TEXAS_LOCATION_STATS = {
  countyCount: texasLocations.countyCount,
  cityCount: texasLocations.cityCount,
};

export function countyCoverageTier(countyName: string): ServiceCoverageTier {
  if (PRIMARY.has(countyName)) return "primary";
  if (EXTENDED.has(countyName)) return "extended";
  if (HAR_CORE.has(countyName)) return "har-core";
  if (HAR_EXTENDED.has(countyName)) return "har-extended";
  return "statewide";
}

export function isActiveListQikCounty(countyName: string): boolean {
  return ACTIVE.has(countyName);
}

export function getCountyBySlug(countySlug: string): TexasLocationCounty | undefined {
  return TEXAS_COUNTIES.find((c) => c.countySlug === countySlug);
}

export function getCityBySlugs(
  countySlug: string,
  citySlug: string,
): { county: TexasLocationCounty; city: TexasLocationCity } | undefined {
  const county = getCountyBySlug(countySlug);
  if (!county) return undefined;
  const city = county.cities.find((c) => c.slug === citySlug);
  if (!city) return undefined;
  return { county, city };
}

export function countyPagePath(countySlug: string): string {
  return `/service-area/texas/${countySlug}`;
}

export function cityPagePath(countySlug: string, citySlug: string): string {
  return `/service-area/texas/${countySlug}/${citySlug}`;
}

export function coverageLabel(tier: ServiceCoverageTier): string {
  switch (tier) {
    case "primary":
      return "Primary ListQik service county";
    case "extended":
      return "Extended ListQik service county";
    case "har-core":
      return "Houston HAR core market county";
    case "har-extended":
      return "Houston HAR extended market county";
    default:
      return "Texas statewide listing support";
  }
}

export function countySeoTitle(countyName: string): string {
  return `Sell Your Home in ${countyName} County, TX | ListQik`;
}

export function countySeoDescription(countyName: string, tier: ServiceCoverageTier, cityCount: number): string {
  const coverage = coverageLabel(tier).toLowerCase();
  return `ListQik helps Texas sellers in ${countyName} County with broker-backed MLS listing support. ${coverage}. Explore ${cityCount} cities and towns in ${countyName} County and start your listing online.`;
}

export function citySeoTitle(cityName: string, countyName: string): string {
  return `List Your Home in ${cityName}, ${countyName} County TX | ListQik`;
}

export function citySeoDescription(
  cityName: string,
  countyName: string,
  tier: ServiceCoverageTier,
): string {
  const coverage = coverageLabel(tier).toLowerCase();
  return `Sell or list a home in ${cityName}, ${countyName} County, Texas with ListQik. ${coverage}. Compare pricing, complete seller intake, and work with licensed brokerage support.`;
}

export function allCountyStaticParams(): { countySlug: string }[] {
  return TEXAS_COUNTIES.map((c) => ({ countySlug: c.countySlug }));
}

export function allCityStaticParams(): { countySlug: string; citySlug: string }[] {
  const params: { countySlug: string; citySlug: string }[] = [];
  for (const county of TEXAS_COUNTIES) {
    for (const city of county.cities) {
      params.push({ countySlug: county.countySlug, citySlug: city.slug });
    }
  }
  return params;
}

export function allLocationSitemapPaths(): string[] {
  const paths = ["/service-area/texas"];
  for (const county of TEXAS_COUNTIES) {
    paths.push(countyPagePath(county.countySlug));
    for (const city of county.cities) {
      paths.push(cityPagePath(county.countySlug, city.slug));
    }
  }
  return paths;
}
