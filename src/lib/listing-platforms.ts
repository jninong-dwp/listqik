export const LISTING_PLATFORM_IDS = ["MLS", "ZILLOW", "REALTOR_COM", "OTHER_PLATFORMS"] as const;

export type ListingPlatformId = (typeof LISTING_PLATFORM_IDS)[number];

export const LISTING_PLATFORM_OPTIONS: { id: ListingPlatformId; label: string }[] = [
  { id: "MLS", label: "MLS" },
  { id: "ZILLOW", label: "Zillow" },
  { id: "REALTOR_COM", label: "Realtor.com" },
  { id: "OTHER_PLATFORMS", label: "Other listing platforms" },
];

export function isListingPlatformId(v: string): v is ListingPlatformId {
  return (LISTING_PLATFORM_IDS as readonly string[]).includes(v);
}

export function normalizeListingPlatforms(raw: unknown): ListingPlatformId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<ListingPlatformId>();
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (isListingPlatformId(id)) seen.add(id);
  }
  return [...seen];
}
