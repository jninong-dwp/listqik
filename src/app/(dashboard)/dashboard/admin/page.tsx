import Link from "next/link";
import { connectDb } from "@/lib/mongodb";
import {
  estimateSetupProgress,
  getListingBlockers,
  listingAddressShort,
  userAccountStatus,
} from "@/lib/admin-insights";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";
import { ListingOffer } from "@/models/ListingOffer";
import { ListingUpgradeRequest } from "@/models/ListingUpgradeRequest";
import { PlanPurchase } from "@/models/PlanPurchase";
import { PricingCheckoutSession } from "@/models/PricingCheckoutSession";
import { UpgradePurchase } from "@/models/UpgradePurchase";
import { User } from "@/models/User";

const sections = [
  { href: "/dashboard/admin/purchases", title: "Purchases", description: "Plan checkouts and paid upgrades." },
  { href: "/dashboard/admin/users", title: "Users", description: "Accounts, activity, and profiles." },
  { href: "/dashboard/admin/listings", title: "Listings", description: "Compliance queue and setup progress." },
  { href: "/dashboard/admin/documents", title: "Documents", description: "All uploaded listing documents." },
  { href: "/dashboard/admin/offers", title: "Offers", description: "Buyer offers across listings." },
  { href: "/dashboard/admin/upgrade-requests", title: "Upgrade requests", description: "Pending service requests." },
  { href: "/dashboard/admin/checkouts", title: "Checkouts", description: "Pricing funnel and abandoned carts." },
  { href: "/dashboard/admin/settings", title: "Settings", description: "Admin access configuration." },
] as const;

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-emerald-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/50">{hint}</p> : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  await connectDb();

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    userCount,
    listingCount,
    incompleteListings,
    activeListings,
    pendingListings,
    soldListings,
    planPurchases7d,
    upgradePurchases7d,
    openUpgradeRequests,
    recentOffers,
    abandonedCheckouts,
    users,
    listings,
    documents,
  ] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Listing.countDocuments({ status: "INCOMPLETE" }),
    Listing.countDocuments({ status: "ACTIVE" }),
    Listing.countDocuments({ status: "PENDING" }),
    Listing.countDocuments({ status: "SOLD" }),
    PlanPurchase.countDocuments({ purchasedAt: { $gte: sevenDaysAgo } }),
    UpgradePurchase.countDocuments({ purchasedAt: { $gte: sevenDaysAgo } }),
    ListingUpgradeRequest.countDocuments({ status: { $in: ["REQUESTED", "IN_REVIEW"] } }),
    ListingOffer.countDocuments({ status: "RECEIVED", createdAt: { $gte: oneDayAgo } }),
    PricingCheckoutSession.countDocuments({ planPaid: false, createdAt: { $lt: oneDayAgo } }),
    User.find().select("_id email name passwordSetupTokenSha256 passwordSetupExpiresAt userAgreementAcknowledgedAt").lean(),
    Listing.find({ status: "INCOMPLETE" }).sort({ updatedAt: -1 }).limit(40).lean(),
    ListingDocument.find().select("listingId fileName").lean(),
  ]);

  const docsByListing = new Map<string, string[]>();
  for (const doc of documents) {
    const key = String(doc.listingId);
    const bucket = docsByListing.get(key) ?? [];
    bucket.push(doc.fileName ?? "");
    docsByListing.set(key, bucket);
  }

  const userById = new Map(users.map((u) => [String(u._id), u]));

  const stuckListings = listings
    .map((listing) => {
      const blockers = getListingBlockers(listing, docsByListing.get(String(listing._id)) ?? []);
      const progress = estimateSetupProgress(listing);
      return {
        listing,
        blockers,
        progress,
        owner: userById.get(String(listing.userId)),
      };
    })
    .filter((row) => row.blockers.length > 0 || !row.listing.setupFinalizedAt)
    .slice(0, 8);

  const accountIssues = users
    .map((user) => ({ user, status: userAccountStatus(user) }))
    .filter((row) => row.status.tone === "warn")
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Overview</h2>
        <p className="mt-1 text-sm text-white/65">Platform health, funnel signals, and items that need attention.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={userCount} />
        <StatCard label="Listings" value={listingCount} hint={`${incompleteListings} incomplete`} />
        <StatCard label="Purchases (7d)" value={planPurchases7d + upgradePurchases7d} hint={`${planPurchases7d} plans · ${upgradePurchases7d} upgrades`} />
        <StatCard label="Needs attention" value={openUpgradeRequests + recentOffers + abandonedCheckouts} hint="Requests, new offers, stale checkouts" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active listings" value={activeListings} />
        <StatCard label="Pending" value={pendingListings} />
        <StatCard label="Sold" value={soldListings} />
        <StatCard label="Open upgrade requests" value={openUpgradeRequests} />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-200/90">Needs attention</h3>
          <Link href="/dashboard/admin/listings?filter=stuck" className="text-xs font-semibold text-emerald-300 underline">
            View all stuck listings →
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-4">
            <h4 className="text-sm font-semibold text-amber-100">Incomplete listings ({stuckListings.length})</h4>
            {stuckListings.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">No incomplete listings with blockers right now.</p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm">
                {stuckListings.map(({ listing, blockers, progress, owner }) => (
                  <li key={String(listing._id)} className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="font-medium text-white/90">{listingAddressShort(listing)}</p>
                    <p className="mt-1 text-xs text-white/55">
                      {progress.pct}% setup · {blockers.length} blocker{blockers.length === 1 ? "" : "s"}
                      {owner ? ` · ${owner.name}` : ""}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-amber-100/80">{blockers[0]}</p>
                    {owner ? (
                      <Link
                        className="mt-2 inline-block text-xs font-semibold text-emerald-300 underline"
                        href={`/dashboard/admin/users/${String(owner._id)}`}
                      >
                        Open profile
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/15 bg-black/30 p-4">
              <h4 className="text-sm font-semibold text-emerald-100">Account issues ({accountIssues.length})</h4>
              {accountIssues.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">All recent accounts look set up.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {accountIssues.map(({ user, status }) => (
                    <li key={String(user._id)} className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 first:border-0 first:pt-0">
                      <span>
                        {user.name} <span className="text-white/50">({user.email})</span>
                      </span>
                      <span className="text-xs text-amber-200">{status.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/30 p-4 text-sm">
              <p>
                <span className="text-white/55">New offers (24h):</span>{" "}
                <span className="font-semibold text-white/90">{recentOffers}</span>
              </p>
              <p className="mt-2">
                <span className="text-white/55">Abandoned checkouts (&gt;24h, unpaid):</span>{" "}
                <span className="font-semibold text-white/90">{abandonedCheckouts}</span>
              </p>
              <Link href="/dashboard/admin/checkouts" className="mt-3 inline-block text-xs font-semibold text-emerald-300 underline">
                Open checkout funnel →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-100/80">Sections</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl border border-white/10 bg-black/35 p-5 transition hover:border-emerald-400/35 hover:bg-emerald-950/20"
            >
              <h3 className="font-semibold text-emerald-100 group-hover:text-emerald-50">{s.title}</h3>
              <p className="mt-2 text-sm text-white/65">{s.description}</p>
              <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-emerald-400/90">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
