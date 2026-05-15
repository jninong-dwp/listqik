import Link from "next/link";
import { connectDb } from "@/lib/mongodb";
import {
  extractGenericCouponCode,
  extractStripeCheckoutCouponCode,
} from "@/lib/stripe-purchase-details";
import { PlanPurchase } from "@/models/PlanPurchase";
import { UpgradePurchase } from "@/models/UpgradePurchase";
import { User } from "@/models/User";

type PurchaseRow = {
  id: string;
  kind: "plan" | "upgrade";
  sortAt: number;
  purchasedAtLabel: string;
  purchaserEmail: string;
  userName: string | null;
  userId: string | null;
  summary: string;
  detail: string;
  amountLabel: string;
  couponCode: string;
  paymentStatus: string;
  orderRef: string;
};

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return "—";
  const cur = (currency || "usd").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function sortKey(purchasedAt: Date | null | undefined, createdAt: Date | null | undefined): number {
  const primary = purchasedAt ? new Date(purchasedAt).getTime() : NaN;
  const fallback = createdAt ? new Date(createdAt).getTime() : 0;
  return Number.isFinite(primary) ? primary : fallback;
}

export default async function AdminPurchasesPage() {
  await connectDb();

  const [plans, upgrades, users] = await Promise.all([
    PlanPurchase.find().sort({ purchasedAt: -1, createdAt: -1 }).lean(),
    UpgradePurchase.find().sort({ purchasedAt: -1, createdAt: -1 }).lean(),
    User.find().select("_id email name").lean(),
  ]);

  const userById = new Map(users.map((u) => [String(u._id), u]));
  const userByEmail = new Map(users.map((u) => [u.email?.trim().toLowerCase() ?? "", u]));

  const rows: PurchaseRow[] = [];

  for (const plan of plans) {
    const email = plan.purchaserEmail?.trim().toLowerCase() ?? "";
    const userId = plan.userId ? String(plan.userId) : null;
    const user = (userId && userById.get(userId)) || (email ? userByEmail.get(email) : undefined);

    rows.push({
      id: `plan-${String(plan._id)}`,
      kind: "plan",
      sortAt: sortKey(plan.purchasedAt, plan.createdAt),
      purchasedAtLabel: formatDate(plan.purchasedAt ?? plan.createdAt),
      purchaserEmail: plan.purchaserEmail ?? "—",
      userName: user?.name ?? null,
      userId: user ? String(user._id) : userId,
      summary: plan.planName || plan.planId || "Listing plan",
      detail: `Plan ID: ${plan.planId} · Status: ${plan.status ?? "—"}`,
      amountLabel: formatMoney(plan.amountTotal ?? null, plan.currency ?? "usd"),
      couponCode: plan.couponCode?.trim() || "—",
      paymentStatus: plan.paymentStatus?.trim() || "—",
      orderRef: plan.externalOrderId?.trim() || "—",
    });
  }

  for (const upgrade of upgrades) {
    const email = upgrade.purchaserEmail?.trim().toLowerCase() ?? "";
    const userId = upgrade.userId
      ? String(upgrade.userId)
      : upgrade.externalUserId && /^[a-f0-9]{24}$/i.test(upgrade.externalUserId)
        ? upgrade.externalUserId
        : null;
    const user = (userId && userById.get(userId)) || (email ? userByEmail.get(email) : undefined);

    const slugs = (upgrade.upgradeSlugs ?? []).filter((s: unknown) => typeof s === "string" && s.trim());
    const itemNames = (upgrade.items ?? [])
      .map((item: { name?: string | null }) => item?.name?.trim())
      .filter((name: string | undefined): name is string => Boolean(name));

    const couponCode =
      extractStripeCheckoutCouponCode(upgrade.rawPayload) ||
      extractGenericCouponCode(upgrade.rawPayload) ||
      "—";

    const summary =
      itemNames.length > 0
        ? itemNames.join(", ")
        : slugs.length > 0
          ? slugs.join(", ")
          : "Upgrade purchase";

    rows.push({
      id: `upgrade-${String(upgrade._id)}`,
      kind: "upgrade",
      sortAt: sortKey(upgrade.purchasedAt, upgrade.createdAt),
      purchasedAtLabel: formatDate(upgrade.purchasedAt ?? upgrade.createdAt),
      purchaserEmail: upgrade.purchaserEmail ?? "—",
      userName: user?.name ?? null,
      userId: user ? String(user._id) : userId,
      summary,
      detail:
        slugs.length > 0
          ? `${slugs.length} upgrade slug(s) · ${upgrade.items?.length ?? 0} line item(s)`
          : `${upgrade.items?.length ?? 0} line item(s)`,
      amountLabel: formatMoney(upgrade.amountTotal ?? null, upgrade.currency ?? "usd"),
      couponCode,
      paymentStatus: upgrade.paymentStatus?.trim() || "—",
      orderRef: upgrade.externalOrderId?.trim() || upgrade.checkoutSessionId?.trim() || "—",
    });
  }

  rows.sort((a, b) => b.sortAt - a.sortAt);

  const planCount = rows.filter((r) => r.kind === "plan").length;
  const upgradeCount = rows.filter((r) => r.kind === "upgrade").length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-emerald-50">Purchases</h2>
        <p className="text-sm text-white/65">
          All plan checkouts and paid upgrades across the platform, newest first.
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-white/60">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
            <span className="font-semibold text-white/85">{rows.length}</span> total
          </span>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-950/30 px-3 py-1">
            <span className="font-semibold text-emerald-100">{planCount}</span> plans
          </span>
          <span className="rounded-full border border-cyan-500/25 bg-cyan-950/25 px-3 py-1">
            <span className="font-semibold text-cyan-100">{upgradeCount}</span> upgrades
          </span>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-black/30 p-8 text-center text-sm text-white/65">
          No purchases recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/30">
          <table className="min-w-[1100px] w-full text-left text-sm text-white/90">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/70">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Buyer</th>
                <th className="px-3 py-2">Plan / upgrades</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Coupon</th>
                <th className="px-3 py-2">Payment</th>
                <th className="px-3 py-2">Order ref</th>
                <th className="px-3 py-2">Profile</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-white/10 align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-white/75">
                    {row.purchasedAtLabel}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={[
                        "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        row.kind === "plan"
                          ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-100"
                          : "border-cyan-400/35 bg-cyan-500/15 text-cyan-100",
                      ].join(" ")}
                    >
                      {row.kind}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{row.userName ?? "—"}</div>
                    <div className="text-xs text-white/55">{row.purchaserEmail}</div>
                  </td>
                  <td className="max-w-xs px-3 py-2">
                    <div className="font-medium text-emerald-50">{row.summary}</div>
                    <div className="mt-0.5 text-xs text-white/55">{row.detail}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{row.amountLabel}</td>
                  <td className="px-3 py-2 text-xs">{row.couponCode}</td>
                  <td className="px-3 py-2 text-xs capitalize">{row.paymentStatus}</td>
                  <td className="max-w-[140px] truncate px-3 py-2 font-mono text-[11px] text-white/55" title={row.orderRef}>
                    {row.orderRef}
                  </td>
                  <td className="px-3 py-2">
                    {row.userId ? (
                      <Link
                        className="text-emerald-300 underline"
                        href={`/dashboard/admin/users/${row.userId}`}
                      >
                        Open
                      </Link>
                    ) : (
                      <span className="text-white/45">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-white/50">
        Coupon codes appear when Stripe or the payment webhook stored them. Older plan purchases may
        show &quot;—&quot; until new checkouts complete after this update.
      </p>
    </div>
  );
}
