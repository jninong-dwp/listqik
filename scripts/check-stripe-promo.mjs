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

async function inspect(code) {
  const listed = await stripe.promotionCodes.list({ code, limit: 10 });
  console.log(`\n=== ${code} (${listed.data.length} found) ===`);
  for (const p of listed.data) {
    const full = await stripe.promotionCodes.retrieve(p.id, { expand: ["coupon", "promotion.coupon"] });
    const couponRef =
      full.coupon ??
      (full.promotion && typeof full.promotion === "object" && "coupon" in full.promotion
        ? full.promotion.coupon
        : null);
    const couponId = typeof couponRef === "string" ? couponRef : couponRef?.id;
    const coupon = couponId ? await stripe.coupons.retrieve(couponId) : null;
    console.log(
      JSON.stringify(
        {
          promotion_id: full.id,
          active: full.active,
          expires_at: full.expires_at,
          max_redemptions: full.max_redemptions,
          times_redeemed: full.times_redeemed,
          restrictions: full.restrictions,
          promotion: full.promotion,
          coupon: coupon
            ? {
                id: coupon.id,
                valid: coupon.valid,
                percent_off: coupon.percent_off,
                amount_off: coupon.amount_off,
                currency: coupon.currency,
                applies_to: coupon.applies_to,
              }
            : null,
        },
        null,
        2,
      ),
    );
  }
}

loadEnvLocal();
const secret = process.env.STRIPE_SECRET_KEY?.trim();
if (!secret) throw new Error("Missing STRIPE_SECRET_KEY");
const stripe = new Stripe(secret);
console.log("mode:", secret.startsWith("sk_live") ? "live" : secret.startsWith("sk_test") ? "test" : "unknown");

await inspect("LISTQIK100");
await inspect("STARTNOW79");

const sessions = await stripe.checkout.sessions.list({ limit: 3 });
console.log("\nRecent checkout sessions:");
for (const s of sessions.data) {
  console.log({
    id: s.id,
    amount_total: s.amount_total,
    currency: s.currency,
    adaptive_pricing: s.adaptive_pricing,
    presentment_details: s.presentment_details,
    allow_promotion_codes: s.allow_promotion_codes,
    discounts: s.discounts,
  });
}
