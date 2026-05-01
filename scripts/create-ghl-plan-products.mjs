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
if (!token || !locationId) {
  console.error("Missing GHL_PRIVATE_INTEGRATION_TOKEN or GHL_LOCATION_ID");
  process.exit(1);
}

const HighLevel = HighLevelImport.default ?? HighLevelImport;
const ghl = new HighLevel({
  privateIntegrationToken: token,
  apiVersion: process.env.GHL_API_VERSION?.trim() || "2021-07-28",
});

const plans = [
  { slug: "subsonic", name: "Subsonic", amount: 99 },
  { slug: "supersonic", name: "Supersonic", amount: 195 },
  { slug: "hypersonic", name: "Hypersonic", amount: 395 },
];

const list = await ghl.products.listInvoices(
  { locationId, limit: 200, offset: 0 },
  { preferredTokenType: "location" },
);

const existingByName = new Map(
  (list.products ?? []).map((p) => [p.name.trim().toLowerCase(), p]),
);

const createdOrFound = {};
const planPriceIds = {};

for (const plan of plans) {
  let product = existingByName.get(plan.name.toLowerCase());
  if (!product) {
    product = await ghl.products.createProduct(
      {
        name: plan.name,
        locationId,
        productType: "DIGITAL",
        availableInStore: true,
        slug: plan.slug,
        description: `${plan.name} seller listing plan`,
      },
      { preferredTokenType: "location" },
    );
    console.log(`Created product: ${plan.name} (${product._id})`);
  } else {
    console.log(`Found product: ${plan.name} (${product._id})`);
  }

  const prices = await ghl.products.listPricesForProduct(
    { productId: product._id, locationId, limit: 50, offset: 0 },
    { preferredTokenType: "location" },
  );
  const matchingPrice = (prices.prices ?? []).find(
    (pr) => typeof pr.amount === "number" && Math.round(pr.amount) === plan.amount,
  );

  if (!matchingPrice) {
    const newPrice = await ghl.products.createPriceForProduct(
      { productId: product._id },
      {
        name: `${plan.name} One-Time`,
        type: "one_time",
        currency: "USD",
        amount: plan.amount,
        locationId,
      },
      { preferredTokenType: "location" },
    );
    console.log(`Created price: ${plan.name} (${newPrice._id})`);
    planPriceIds[plan.slug] = newPrice._id;
  } else {
    console.log(`Found matching price: ${plan.name} (${matchingPrice._id})`);
    planPriceIds[plan.slug] = matchingPrice._id;
  }

  createdOrFound[plan.slug] = product._id;
}

console.log(`PLAN_PRODUCT_IDS_JSON=${JSON.stringify(createdOrFound)}`);
console.log(`PLAN_PRICE_IDS_JSON=${JSON.stringify(planPriceIds)}`);
