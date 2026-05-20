import fs from "fs";
import path from "path";
import Stripe from "stripe";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function parsePlanMap() {
  const raw = process.env.STRIPE_PLAN_PRICE_IDS_JSON;
  if (!raw) return {};
  return JSON.parse(raw);
}

loadEnvLocal();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const planMap = parsePlanMap();
const subsonicPriceId = planMap.subsonic;
if (!subsonicPriceId) throw new Error("No subsonic price in STRIPE_PLAN_PRICE_IDS_JSON");

const promo = await stripe.promotionCodes.list({ code: "LISTQIK100", limit: 1 });
const promoId = promo.data[0]?.id;
if (!promoId) throw new Error("LISTQIK100 not found");

for (const label of [
  "pre-applied LISTQIK100",
  "allow_promotion_codes only",
  "allow_promotion_codes + adaptive_pricing off",
]) {
  const params = {
    mode: "payment",
    ui_mode: "embedded_page",
    line_items: [{ price: subsonicPriceId, quantity: 1 }],
    return_url: "https://example.com/return",
  };
  if (label.startsWith("pre-applied")) {
    params.discounts = [{ promotion_code: promoId }];
  } else {
    params.allow_promotion_codes = true;
  }
  if (label.includes("adaptive_pricing off")) {
    params.adaptive_pricing = { enabled: false };
  }
  try {
    const session = await stripe.checkout.sessions.create(params);
    console.log(`OK ${label}:`, session.id, "total", session.amount_total, session.currency);
  } catch (e) {
    console.log(`FAIL ${label}:`, e.message);
  }
}
