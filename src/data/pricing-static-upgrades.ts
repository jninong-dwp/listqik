import { pricingUpgradeMeta } from "@/data/pricing-upgrade-meta";
import type { WizardUpgrade } from "@/types/pricing-wizard";

function staticPriceBySlug(slug: string): number {
  const map: Record<string, number> = {
    "premium-photography-spotlight-listing": 495,
    "smart-market-analysis": 195,
    "real-time-showing-management": 59,
    "open-house-directional-signs-set-of-5": 49,
    "professional-yard-sign": 49,
    "yard-sign-open-house-signs-bundle": 87,
    lockbox: 49,
    "upgrade-listing-to-maximum-photos": 99,
    "add-a-video-owner-provided": 40,
    "unlimited-open-house-announcements": 100,
    "list-in-an-additional-mls": 99,
    "personal-transaction-coordinator-service": 395,
    "contract-preparation-review": 595,
    "open-house-announcement": 25,
  };
  return map[slug] ?? 0;
}

/** Client-safe fallback if `/api/ghl/pricing/upgrades` fails (mirrors server static list). */
export const staticWizardUpgrades: WizardUpgrade[] = pricingUpgradeMeta.map((m) => ({
  slug: m.slug,
  name: m.name,
  description: m.description,
  toggleAddLabel: m.toggleAddLabel,
  toggleRemoveLabel: m.toggleRemoveLabel,
  recommendedFor: [...m.recommendedFor],
  ghlProductId: m.slug,
  price: staticPriceBySlug(m.slug),
}));
