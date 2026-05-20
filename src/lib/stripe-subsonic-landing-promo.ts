import type Stripe from "stripe";

export type SubsonicLandingCheckoutDiscount = {
  promotion_code?: string;
  coupon?: string;
};

/** Query param value: `/pricing?plan=subsonic&promo=start-now` */
export const START_NOW_SUBSONIC_PROMO = "start-now";

export function isStartNowSubsonicPromo(value: string | undefined | null): boolean {
  return value?.trim().toLowerCase() === START_NOW_SUBSONIC_PROMO;
}

export function startNowSubsonicPricingHref(locale?: "en" | "es"): string {
  const base = `/pricing?plan=subsonic&promo=${START_NOW_SUBSONIC_PROMO}`;
  return locale === "es" ? `${base}&lang=es` : base;
}

/** True when URL should auto-select Subsonic and open step 1 (property address) intake. */
export function shouldOpenSubsonicIntakeFromSearchParams(
  params: Pick<URLSearchParams, "get">,
): boolean {
  const plan = params.get("plan")?.trim().toLowerCase();
  return plan === "subsonic" && isStartNowSubsonicPromo(params.get("promo"));
}

/**
 * Resolves Stripe Checkout `discounts` for the landing-page Subsonic offer ($99 → $79).
 * Prefer STRIPE_SUBSONIC_LANDING_PROMOTION_CODE_ID; else lookup by promo code; else coupon id.
 */
export async function resolveSubsonicLandingCheckoutDiscounts(
  stripe: Stripe,
): Promise<SubsonicLandingCheckoutDiscount[] | undefined> {
  const promotionCodeId = process.env.STRIPE_SUBSONIC_LANDING_PROMOTION_CODE_ID?.trim();
  if (promotionCodeId) {
    return [{ promotion_code: promotionCodeId }];
  }

  const promoCode =
    process.env.STRIPE_SUBSONIC_LANDING_PROMO_CODE?.trim() || "STARTNOW79";
  const listed = await stripe.promotionCodes.list({
    code: promoCode,
    active: true,
    limit: 1,
  });
  if (listed.data[0]?.id) {
    return [{ promotion_code: listed.data[0].id }];
  }

  const couponId = process.env.STRIPE_SUBSONIC_LANDING_COUPON_ID?.trim();
  if (couponId) {
    return [{ coupon: couponId }];
  }

  return undefined;
}
