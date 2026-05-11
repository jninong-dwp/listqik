/**
 * Normalizes listing address fields and rejects placeholder junk ("null", "n/a", …)
 * that otherwise slips past `.trim()` validation.
 */

const ADDRESS_PLACEHOLDERS = new Set([
  "null",
  "undefined",
  "none",
  "n/a",
  "na",
  "tbd",
  "unknown",
  "-",
  "--",
  ".",
]);

/** Optional unit — empty after normalize means omit */
export function normalizeListingAddressPart(raw: string | null | undefined): string | undefined {
  if (raw == null) return undefined;
  const t = String(raw).trim();
  if (!t) return undefined;
  const lower = t.toLowerCase();
  if (ADDRESS_PLACEHOLDERS.has(lower)) return undefined;
  return t;
}

export function hasMeaningfulListingAddressText(value?: string | null): boolean {
  return Boolean(normalizeListingAddressPart(value ?? undefined));
}

export function hasValidCoreListingAddress(fields: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}): boolean {
  return (
    hasMeaningfulListingAddressText(fields.street) &&
    hasMeaningfulListingAddressText(fields.city) &&
    hasMeaningfulListingAddressText(fields.state) &&
    hasMeaningfulListingAddressText(fields.zip)
  );
}

export function formatListingAddressLine(fields: {
  street?: string | null;
  unit?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}): string {
  const street = normalizeListingAddressPart(fields.street ?? undefined);
  const unit = normalizeListingAddressPart(fields.unit ?? undefined);
  const city = normalizeListingAddressPart(fields.city ?? undefined);
  const state = normalizeListingAddressPart(fields.state ?? undefined);
  const zip = normalizeListingAddressPart(fields.zip ?? undefined);
  const cityState = [city, state].filter(Boolean).join(", ");
  const parts = [street, unit, cityState, zip].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Address incomplete — finish listing setup";
}
