import Link from "next/link";
import { connectDb } from "@/lib/mongodb";
import { formatAdminDate } from "@/lib/admin-insights";
import { PricingCheckoutSession } from "@/models/PricingCheckoutSession";
import { User } from "@/models/User";

export default async function AdminCheckoutsPage() {
  await connectDb();
  const sessions = await PricingCheckoutSession.find().sort({ createdAt: -1 }).lean();
  const emails = [...new Set(sessions.map((s) => s.purchaserEmail?.toLowerCase()).filter(Boolean))];
  const users =
    emails.length > 0
      ? await User.find({ email: { $in: emails } }).select("_id name email").lean()
      : [];
  const userByEmail = new Map(users.map((u) => [u.email?.toLowerCase() ?? "", u]));

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Checkouts</h2>
        <p className="mt-1 text-sm text-white/65">
          Pricing funnel sessions — unpaid rows older than 24 hours are likely abandoned.
        </p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/30">
        <table className="min-w-full text-left text-sm text-white/90">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/70">
            <tr>
              <th className="px-3 py-2">Started</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Upgrades</th>
              <th className="px-3 py-2">Plan paid</th>
              <th className="px-3 py-2">Upgrades paid</th>
              <th className="px-3 py-2">Account</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const email = session.purchaserEmail?.toLowerCase() ?? "";
              const user = userByEmail.get(email);
              const created = session.createdAt ? new Date(session.createdAt).getTime() : 0;
              const abandoned = !session.planPaid && created > 0 && created < oneDayAgo;
              return (
                <tr
                  key={String(session._id)}
                  className={`border-t border-white/10 align-top ${abandoned ? "bg-amber-950/15" : ""}`}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{formatAdminDate(session.createdAt)}</td>
                  <td className="px-3 py-2">{session.purchaserEmail}</td>
                  <td className="px-3 py-2">{session.planId}</td>
                  <td className="px-3 py-2 text-xs">
                    {(session.selectedUpgradeSlugs ?? []).length > 0
                      ? (session.selectedUpgradeSlugs ?? []).join(", ")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">{session.planPaid ? "Yes" : abandoned ? "No (stale)" : "No"}</td>
                  <td className="px-3 py-2">{session.upgradesPaid ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">
                    {user ? (
                      <Link className="text-emerald-300 underline" href={`/dashboard/admin/users/${String(user._id)}`}>
                        {user.name}
                      </Link>
                    ) : (
                      <span className="text-white/50">No account</span>
                    )}
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
