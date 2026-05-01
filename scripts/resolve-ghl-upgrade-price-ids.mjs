import fs from "fs";
import path from "path";
import HighLevelImport from "@gohighlevel/api-client";

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnvLocal();

const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim();
const locationId = process.env.GHL_LOCATION_ID?.trim();
const rawMap = process.env.GHL_UPGRADE_PRODUCT_IDS?.trim();

if (!token || !locationId || !rawMap) {
  console.error("Missing GHL_PRIVATE_INTEGRATION_TOKEN, GHL_LOCATION_ID, or GHL_UPGRADE_PRODUCT_IDS");
  process.exit(1);
}

const HighLevel = HighLevelImport.default ?? HighLevelImport;
const ghl = new HighLevel({
  privateIntegrationToken: token,
  apiVersion: process.env.GHL_API_VERSION?.trim() || "2021-07-28",
});

let productMap;
try {
  productMap = JSON.parse(rawMap);
} catch (e) {
  console.error("GHL_UPGRADE_PRODUCT_IDS is not valid JSON:", e instanceof Error ? e.message : e);
  process.exit(1);
}

const out = {};

for (const [slug, productId] of Object.entries(productMap)) {
  try {
    const prices = await ghl.products.listPricesForProduct(
      { productId, locationId, limit: 20, offset: 0 },
      { preferredTokenType: "location" },
    );
    const first = prices.prices?.[0];
    if (first?._id) {
      out[slug] = first._id;
      console.log(`OK ${slug} => ${first._id}`);
    } else {
      console.log(`NO_PRICE ${slug} (${productId})`);
    }
  } catch (e) {
    const msg =
      e && typeof e === "object" && "response" in e
        ? JSON.stringify(e.response?.data ?? {})
        : e instanceof Error
          ? e.message
          : String(e);
    console.log(`ERR ${slug} (${productId}) ${msg}`);
  }
}

console.log(`GHL_UPGRADE_PRICE_IDS=${JSON.stringify(out)}`);
