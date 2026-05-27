import { pricingUpgradeMeta } from "@/data/pricing-upgrade-meta";

export const PENDING_UPGRADES_STORAGE_KEY = "listqik-pending-upgrade-slugs";

const VALID_SLUGS = new Set(pricingUpgradeMeta.map((row) => row.slug));

function filterValidSlugs(slugs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of slugs) {
    const trimmed = slug.trim();
    if (!trimmed || !VALID_SLUGS.has(trimmed) || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function readPendingUpgradeSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(PENDING_UPGRADES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return filterValidSlugs(parsed.filter((value): value is string => typeof value === "string"));
  } catch {
    return [];
  }
}

export function storePendingUpgradeSlugs(slugs: string[]): void {
  if (typeof window === "undefined") return;
  const normalized = filterValidSlugs(slugs);
  try {
    if (normalized.length === 0) {
      window.sessionStorage.removeItem(PENDING_UPGRADES_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(PENDING_UPGRADES_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    /* ignore storage access issues */
  }
}

export function hasPendingUpgradeSlugs(): boolean {
  return readPendingUpgradeSlugs().length > 0;
}

export function clearPendingUpgradeSlugs(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_UPGRADES_STORAGE_KEY);
  } catch {
    /* ignore storage access issues */
  }
}
