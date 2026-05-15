import Link from "next/link";
import { connectDb } from "@/lib/mongodb";
import { formatAdminDay, userAccountStatus } from "@/lib/admin-insights";
import { Listing } from "@/models/Listing";
import { PlanPurchase } from "@/models/PlanPurchase";
import { UpgradePurchase } from "@/models/UpgradePurchase";
import { User } from "@/models/User";

export default async function AdminUsersPage() {
  await connectDb();
  const [users, plans, upgrades, listings] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    PlanPurchase.find({ status: "ACTIVE" }).sort({ purchasedAt: -1, createdAt: -1 }).lean(),
    UpgradePurchase.find().sort({ purchasedAt: -1, createdAt: -1 }).lean(),
    Listing.find().select("userId status setupFinalizedAt updatedAt").lean(),
  ]);

  const planByUser = new Map<string, string>();
  for (const row of plans) {
    const idKey = row.userId ? String(row.userId) : "";
    const emailKey = row.purchaserEmail?.trim().toLowerCase() ?? "";
    if (idKey && !planByUser.has(idKey)) planByUser.set(idKey, row.planName || row.planId);
    if (emailKey && !planByUser.has(emailKey)) planByUser.set(emailKey, row.planName || row.planId);
  }

  const upgradesByUser = new Map<string, Set<string>>();
  for (const row of upgrades) {
    const keys = [
      row.userId ? String(row.userId) : "",
      row.purchaserEmail?.trim().toLowerCase() ?? "",
      row.externalUserId?.trim() ?? "",
    ].filter(Boolean);
    for (const key of keys) {
      const set = upgradesByUser.get(key) ?? new Set<string>();
      for (const slug of row.upgradeSlugs ?? []) {
        const clean = String(slug ?? "").trim();
        if (clean) set.add(clean);
      }
      upgradesByUser.set(key, set);
    }
  }

  const listingsByUser = new Map<string, typeof listings>();
  for (const listing of listings) {
    const key = String(listing.userId);
    const bucket = listingsByUser.get(key) ?? [];
    bucket.push(listing);
    listingsByUser.set(key, bucket);
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Users</h2>
        <p className="mt-1 text-sm text-white/65">Accounts, listing status, and onboarding state.</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/30">
        <table className="min-w-full text-left text-sm text-white/90">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/70">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Listings</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2">Profile</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const idKey = String(user._id);
              const emailKey = user.email?.trim().toLowerCase() ?? "";
              const plan = planByUser.get(idKey) ?? planByUser.get(emailKey) ?? "None";
              const paidUpgrades = new Set<string>([
                ...(Array.isArray((user as { purchasedUpgradeSlugs?: string[] }).purchasedUpgradeSlugs)
                  ? (user as { purchasedUpgradeSlugs?: string[] }).purchasedUpgradeSlugs ?? []
                  : []),
                ...(upgradesByUser.get(idKey) ? [...(upgradesByUser.get(idKey) as Set<string>)] : []),
                ...(upgradesByUser.get(emailKey) ? [...(upgradesByUser.get(emailKey) as Set<string>)] : []),
              ]);
              const userListings = listingsByUser.get(idKey) ?? [];
              const incomplete = userListings.filter((l) => l.status === "INCOMPLETE").length;
              const active = userListings.filter((l) => l.status === "ACTIVE").length;
              const account = userAccountStatus(user);
              const agreementAt = (user as { userAgreementAcknowledgedAt?: Date | null }).userAgreementAcknowledgedAt;

              return (
                <tr key={idKey} className="border-t border-white/10 align-top">
                  <td className="px-3 py-2">{user.name}</td>
                  <td className="px-3 py-2">{user.email}</td>
                  <td className="px-3 py-2">
                    <p>{plan}</p>
                    {paidUpgrades.size > 0 ? (
                      <p className="mt-1 text-xs text-white/50">{[...paidUpgrades].join(", ")}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {userListings.length === 0 ? (
                      <span className="text-amber-200/90">No listings</span>
                    ) : (
                      <>
                        <span>{userListings.length} total</span>
                        <span className="text-white/50">
                          {" "}
                          · {incomplete} incomplete · {active} active
                        </span>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <p className={account.tone === "warn" ? "text-amber-200" : "text-emerald-200/90"}>
                      {account.label}
                    </p>
                    <p className="text-white/50">
                      {agreementAt ? "Agreement OK" : "Agreement pending"}
                    </p>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-white/55">
                    {formatAdminDay(user.createdAt)}
                  </td>
                  <td className="px-3 py-2">
                    <Link className="text-emerald-300 underline" href={`/dashboard/admin/users/${idKey}`}>
                      Open Profile
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
