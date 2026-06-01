/**
 * Generates src/data/texas-locations.json for service-area SEO pages.
 * Counties: all 254 Texas counties (us-atlas).
 * Cities: SimpleMaps uscities CSV (TX rows), grouped by county name.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const usAtlas = JSON.parse(
  readFileSync(require.resolve("us-atlas/counties-10m.json"), "utf8"),
);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "src/data/texas-locations.json");

const US_CITIES_CSV =
  "https://raw.githubusercontent.com/scpike/us-state-county-zip/master/geo-data.csv";

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

async function fetchTexasCities() {
  const res = await fetch(US_CITIES_CSV);
  if (!res.ok) throw new Error(`Failed to fetch cities CSV: ${res.status}`);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]);
  const cityIdx = header.indexOf("city");
  const stateIdx = header.indexOf("state_abbr");
  const countyIdx = header.indexOf("county");
  if (cityIdx < 0 || stateIdx < 0 || countyIdx < 0) {
    throw new Error("Unexpected geo-data CSV header");
  }

  const byCounty = new Map();
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    if (cols[stateIdx] !== "TX") continue;
    const county = cols[countyIdx]?.trim();
    const city = cols[cityIdx]?.trim();
    if (!county || !city) continue;
    const set = byCounty.get(county) ?? new Set();
    set.add(city);
    byCounty.set(county, set);
  }
  return byCounty;
}

function allTexasCounties() {
  const topology = usAtlas;
  const countiesCollection = feature(topology, topology.objects.counties);
  return countiesCollection.features
    .filter((item) => String(item.id ?? "").startsWith("48"))
    .map((item) => String(item.properties?.name ?? "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

const counties = allTexasCounties();
const citiesByCounty = await fetchTexasCities();

const locations = counties.map((county) => {
  const citySet = citiesByCounty.get(county) ?? citiesByCounty.get(`${county} County`) ?? new Set();
  const cities = [...citySet].sort((a, b) => a.localeCompare(b)).map((name) => ({
    name,
    slug: slugify(name),
  }));
  return {
    county,
    countySlug: slugify(`${county}-county`),
    cities,
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  countyCount: locations.length,
  cityCount: locations.reduce((n, c) => n + c.cities.length, 0),
  locations,
};

writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath}`);
console.log(`${payload.countyCount} counties, ${payload.cityCount} cities`);
