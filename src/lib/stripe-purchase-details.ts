/** Extract a human-readable promotion / coupon label from a Stripe Checkout Session object. */
export function extractStripeCheckoutCouponCode(session: unknown): string | null {
  if (!session || typeof session !== "object" || Array.isArray(session)) return null;
  const s = session as Record<string, unknown>;

  const meta = s.metadata;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const m = meta as Record<string, unknown>;
    for (const key of ["couponCode", "coupon_code", "promoCode", "promo_code"]) {
      const v = m[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }

  const promo = s.promotion_code;
  if (typeof promo === "string" && promo.trim()) return promo.trim();
  if (promo && typeof promo === "object" && !Array.isArray(promo)) {
    const code = (promo as { code?: string }).code;
    if (typeof code === "string" && code.trim()) return code.trim();
  }

  const totalDetails = s.total_details;
  if (totalDetails && typeof totalDetails === "object" && !Array.isArray(totalDetails)) {
    const breakdown = (totalDetails as Record<string, unknown>).breakdown;
    if (breakdown && typeof breakdown === "object" && !Array.isArray(breakdown)) {
      const discounts = (breakdown as Record<string, unknown>).discounts;
      if (Array.isArray(discounts)) {
        for (const entry of discounts) {
          if (!entry || typeof entry !== "object") continue;
          const discount = (entry as Record<string, unknown>).discount;
          if (!discount || typeof discount !== "object") continue;
          const d = discount as Record<string, unknown>;
          const promotionCode = d.promotion_code;
          if (promotionCode && typeof promotionCode === "object") {
            const code = (promotionCode as { code?: string }).code;
            if (typeof code === "string" && code.trim()) return code.trim();
          }
          const coupon = d.coupon;
          if (coupon && typeof coupon === "object") {
            const name = (coupon as { name?: string }).name;
            if (typeof name === "string" && name.trim()) return name.trim();
            const id = (coupon as { id?: string }).id;
            if (typeof id === "string" && id.trim()) return id.trim();
          }
        }
      }
    }
    const amountDiscount = (totalDetails as Record<string, unknown>).amount_discount;
    if (typeof amountDiscount === "number" && amountDiscount > 0) {
      return "Promotion applied";
    }
  }

  return null;
}

/** GHL / generic webhook bodies may carry coupon fields at the top level. */
export function extractGenericCouponCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const p = payload as Record<string, unknown>;
  for (const key of [
    "coupon_code",
    "couponCode",
    "promo_code",
    "promoCode",
    "discount_code",
    "discountCode",
  ]) {
    const v = p[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return extractStripeCheckoutCouponCode(payload);
}
