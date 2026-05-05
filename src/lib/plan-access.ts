import type { Types } from "mongoose";
import { PlanPurchase } from "@/models/PlanPurchase";

export type PlanSlug = "subsonic" | "supersonic" | "hypersonic";

const PLAN_PRIORITY: Record<PlanSlug, number> = {
  subsonic: 1,
  supersonic: 2,
  hypersonic: 3,
};

function normalizePlanSlug(raw: string | null | undefined): PlanSlug | null {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "subsonic" || value === "supersonic" || value === "hypersonic") return value;
  return null;
}

export type PlanEntitlements = {
  hasActivePlan: boolean;
  maxPhotosIncluded: boolean;
  prioritySupport: boolean;
  premiumOnboarding: boolean;
};

export type EffectivePlanAccess = {
  planId: PlanSlug | null;
  planName: string | null;
  purchasedAt: string | null;
  entitlements: PlanEntitlements;
};

function entitlementsFor(planId: PlanSlug | null): PlanEntitlements {
  return {
    hasActivePlan: Boolean(planId),
    maxPhotosIncluded: planId === "supersonic" || planId === "hypersonic",
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

