import type { Types } from "mongoose";
import { PlanPurchase } from "@/models/PlanPurchase";

export type PlanSlug = "subsonic" | "supersonic" | "hypersonic";

const PLAN_PRIORITY: Record<PlanSlug, number> = {
  subsonic: 1,
  supersonic: 2,
  hypersonic: 3,
};

export function normalizePlanSlug(raw: string | null | undefined): PlanSlug | null {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "subsonic" || value === "supersonic" || value === "hypersonic") return value;
  return null;
}

export type PlanEntitlements = {
  hasActivePlan: boolean;
  maxPhotosIncluded: boolean;
  /** null = unlimited additional gallery photos */
  maxAdditionalPhotos: number | null;
  complianceFeePct: number;
  prioritySupport: boolean;
  premiumOnboarding: boolean;
};

export type EffectivePlanAccess = {
  planId: PlanSlug | null;
  planName: string | null;
  purchasedAt: string | null;
  entitlements: PlanEntitlements;
};

export function complianceFeePctForPlan(planId: PlanSlug | null): number {
  if (planId === "supersonic") return 0.3;
  if (planId === "hypersonic") return 0.25;
  return 0.5;
}

export function maxAdditionalPhotosForPlan(planId: PlanSlug | null): number | null {
  if (planId === "supersonic" || planId === "hypersonic") return null;
  return 25;
}

function entitlementsFor(planId: PlanSlug | null): PlanEntitlements {
  return {
    hasActivePlan: Boolean(planId),
    maxPhotosIncluded: planId === "supersonic" || planId === "hypersonic",
    maxAdditionalPhotos: maxAdditionalPhotosForPlan(planId),
    complianceFeePct: complianceFeePctForPlan(planId),
    prioritySupport: planId === "supersonic" || planId === "hypersonic",
    premiumOnboarding: planId === "hypersonic",
  };
}

export async function getEffectivePlanAccessForUser(
  userId: Types.ObjectId,
): Promise<EffectivePlanAccess> {
  const rows = await PlanPurchase.find({ userId, status: "ACTIVE" })
    .sort({ purchasedAt: -1, createdAt: -1 })
    .lean();

  if (rows.length === 0) {
    return {
      planId: null,
      planName: null,
      purchasedAt: null,
      entitlements: entitlementsFor(null),
    };
  }

  let best: (typeof rows)[number] | null = null;
  let bestPriority = -1;
  for (const row of rows) {
    const slug = normalizePlanSlug(row.planId);
    const priority = slug ? PLAN_PRIORITY[slug] : 0;
    if (priority > bestPriority) {
      best = row;
      bestPriority = priority;
      continue;
    }
    if (priority === bestPriority && best) {
      const bestTime = new Date(best.purchasedAt ?? best.createdAt ?? 0).getTime();
      const currentTime = new Date(row.purchasedAt ?? row.createdAt ?? 0).getTime();
      if (currentTime > bestTime) best = row;
    }
  }

  const effectiveId = normalizePlanSlug(best?.planId);
  return {
    planId: effectiveId,
    planName: best?.planName ?? null,
    purchasedAt: best?.purchasedAt ? new Date(best.purchasedAt).toISOString() : null,
    entitlements: entitlementsFor(effectiveId),
  };
}

