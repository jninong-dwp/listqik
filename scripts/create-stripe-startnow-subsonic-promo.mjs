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

async function main() {
  loadEnvLocal();
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) throw new Error("Missing STRIPE_SECRET_KEY in .env.local");

  const stripe = new Stripe(secret);
  const code = (process.env.STRIPE_SUBSONIC_LANDING_PROMO_CODE || "STARTNOW79").trim();

  const existing = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
  if (existing.data[0]) {
    const couponRef = existing.data[0].coupon;
    const couponId = typeof couponRef === "string" ? couponRef : couponRef.id;
    console.log(`Promotion code already active: ${code}`);
    console.log(`STRIPE_SUBSONIC_LANDING_PROMO_CODE=${code}`);
    console.log(`STRIPE_SUBSONIC_LANDING_PROMOTION_CODE_ID=${existing.data[0].id}`);
    console.log(`STRIPE_SUBSONIC_LANDING_COUPON_ID=${couponId}`);
    return;
  }

  const coupon = await stripe.coupons.create({
    amount_off: 2000,
    currency: "usd",
    duration: "once",
    name: "Subsonic landing — $20 off",
    metadata: { app_offer: "start-now-subsonic" },
  });

  let promo;
  try {
    promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      active: true,
      metadata: { app_offer: "start-now-subsonic" },
    });
  } catch {
    promo = await stripe.promotionCodes.create({
      promotion: { type: "coupon", coupon: coupon.id },
      code,
      active: true,
      metadata: { app_offer: "start-now-subsonic" },
    });
  }

  console.log(`Created $20 off Subsonic landing promo: ${code}`);
  console.log(`Add to .env.local:`);
  console.log(`STRIPE_SUBSONIC_LANDING_PROMO_CODE=${code}`);
  console.log(`STRIPE_SUBSONIC_LANDING_PROMOTION_CODE_ID=${promo.id}`);
  console.log(`STRIPE_SUBSONIC_LANDING_COUPON_ID=${coupon.id}`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
