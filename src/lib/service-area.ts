import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import usAtlas from "us-atlas/counties-10m.json";

export type ServiceCountyTier = "primary" | "extended" | "other";

export type ServiceAreaMapCounty = {
  name: string;
  label: string;
  tier: ServiceCountyTier;
  path: string;
};

export type TexasCountyMapData = {
  width: number;
  height: number;
  statePath: string;
  counties: ServiceAreaMapCounty[];
};

export const PRIMARY_SERVICE_COUNTIES = [
  "Collin",
  "Denton",
  "Dallas",
  "Tarrant",
] as const;

const EXTENDED_SERVICE_COUNTIES_RAW = [
  "Somervell",
  "Comanche",
  "Palo Pinto",
  "Freestone",
  "Young",
  "Rains",
  "Haskell",
  "Eastland",
  "Wichita",
  "Hamilton",
  "Hunt",
  "Grayson",
  "Archer",
  "Runnels",
  "Delta",
  "Coleman",
  "Rockwall",
  "Cherokee",
  "Henderson",
  "Brown",
  "Navarro",
  "Hopkins",
  "Van Zandt",
  "Hill",
  "Johnson",
  "Jack",
  "Anderson",
  "Tom Green",
  "Fannin",
  "Fisher",
  "Bosque",
  "Taylor",
  "Limestone",
  "Titus",
  "Mitchell",
  "Coke",
  "Walker",
  "Nolan",
  "Red River",
  "Wise",
  "Smith",
  "Throckmorton",
  "Hood",
  "Wood",
  "Erath",
  "Camp",
  "Jones",
  "Scurry",
  "Clay",
  "Franklin",
  "Newton",
  "Kaufman",
  "Cooke",
  "Stonewall",
  "Lamar",
  "Upshur",
  "Callahan",
  "Montague",
  "Ellis",
  "Shackelford",
  "Stephens",
  "Sterling",
] as const;

export const EXTENDED_SERVICE_COUNTIES = [...EXTENDED_SERVICE_COUNTIES_RAW].sort((a, b) =>
  a.localeCompare(b),
);

export const ALL_SERVICE_COUNTIES = [
  ...PRIMARY_SERVICE_COUNTIES,
  ...EXTENDED_SERVICE_COUNTIES,
] as const;

export const PRIMARY_SERVICE_COUNT = PRIMARY_SERVICE_COUNTIES.length;
export const EXTENDED_SERVICE_COUNT = EXTENDED_SERVICE_COUNTIES.length;
export const TOTAL_SERVICE_COUNT = ALL_SERVICE_COUNTIES.length;

function countyLabel(name: string): string {
  return `${name} County`;
}

type AtlasTopology = {
  objects: {
    counties: object;
    states: object;
  };
};

const MAP_WIDTH = 900;
const MAP_HEIGHT = 700;
const MAP_PADDING = 28;
const TEXAS_STATE_FIPS = "48";

export function buildTexasCountyMap(args: {
  primaryCounties: readonly string[];
  extendedCounties: readonly string[];
}): TexasCountyMapData {
  const primaryCountySet = new Set(args.primaryCounties);
  const extendedCountySet = new Set(args.extendedCounties);

  function countyTier(name: string): ServiceCountyTier {
    if (primaryCountySet.has(name)) return "primary";
    if (extendedCountySet.has(name)) return "extended";
    return "other";
  }

  const topology = usAtlas as AtlasTopology;
  const countiesCollection = feature(
    topology as never,
    topology.objects.counties as never,
  ) as unknown as {
    features: Array<{
      id?: string | number;
      properties?: { name?: string };
      geometry: unknown;
      type: string;
    }>;
  };
  const statesCollection = feature(
    topology as never,
    topology.objects.states as never,
  ) as unknown as {
    features: Array<{
      id?: string | number;
      geometry: unknown;
      type: string;
    }>;
  };

  const texasCountyFeatures = countiesCollection.features.filter((item) =>
    String(item.id ?? "").startsWith(TEXAS_STATE_FIPS),
  );
  const texasStateFeature =
    statesCollection.features.find((item) => String(item.id ?? "") === TEXAS_STATE_FIPS) ?? null;

  const projection = geoMercator().fitExtent(
    [
      [MAP_PADDING, MAP_PADDING],
      [MAP_WIDTH - MAP_PADDING, MAP_HEIGHT - MAP_PADDING],
    ],
    {
      type: "FeatureCollection",
      features: texasCountyFeatures,
    } as never,
  );
  const pathBuilder = geoPath(projection);

  const counties: ServiceAreaMapCounty[] = texasCountyFeatures
    .map((item) => {
      const name = String(item.properties?.name ?? "").trim();
      const path = pathBuilder(item as never) ?? "";
      if (!name || !path) return null;
      return {
        name,
        label: countyLabel(name),
        tier: countyTier(name),
        path,
      };
    })
    .filter((item): item is ServiceAreaMapCounty => Boolean(item));

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    statePath: texasStateFeature ? pathBuilder(texasStateFeature as never) ?? "" : "",
    counties,
  };
}

export const TEXAS_SERVICE_AREA_MAP = buildTexasCountyMap({
  primaryCounties: PRIMARY_SERVICE_COUNTIES,
  extendedCounties: EXTENDED_SERVICE_COUNTIES,
});
