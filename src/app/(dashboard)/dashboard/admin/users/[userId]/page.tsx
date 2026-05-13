import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";
import { ListingUpgradeRequest } from "@/models/ListingUpgradeRequest";
import { PlanPurchase } from "@/models/PlanPurchase";
import { UpgradePurchase } from "@/models/UpgradePurchase";
import { User } from "@/models/User";
import { AdminListingDetailsCard } from "@/components/admin/listing-details-card";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  if (!Types.ObjectId.isValid(userId)) notFound();

  await connectDb();
  const user = await User.findById(userId).lean();
  if (!user) notFound();

  const userObjectId = new Types.ObjectId(userId);
  const [listings, plans, upgradePurchases] = await Promise.all([
    Listing.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean(),
    PlanPurchase.find({
      $or: [{ userId: userObjectId }, { purchaserEmail: user.email.toLowerCase().trim() }],
    })
      .sort({ purchasedAt: -1, createdAt: -1 })
      .lean(),
    UpgradePurchase.find({
      $or: [{ userId: userObjectId }, { purchaserEmail: user.email.toLowerCase().trim() }, { externalUserId: userId }],
    })
      .sort({ purchasedAt: -1, createdAt: -1 })
      .lean(),
  ]);

  const listingIds = listings.map((row) => row._id);
  const [documents, upgradeRequests] = await Promise.all([
    listingIds.length > 0 ? ListingDocument.find({ listingId: { $in: listingIds } }).lean() : [],
    listingIds.length > 0 ? ListingUpgradeRequest.find({ listingId: { $in: listingIds } }).lean() : [],
  ]);

  const docsByListing = new Map<string, (typeof documents)[number][]>();
  for (const doc of documents) {
    const key = String(doc.listingId);
    const bucket = docsByListing.get(key) ?? [];
    bucket.push(doc);
    docsByListing.set(key, bucket);
  }

  const requestsByListing = new Map<string, (typeof upgradeRequests)[number][]>();
  for (const req of upgradeRequests) {
    const key = String(req.listingId);
    const bucket = requestsByListing.get(key) ?? [];
    bucket.push(req);
    requestsByListing.set(key, bucket);
  }

  const purchasedUpgradeSet = new Set<string>([
    ...((Array.isArray((user as { purchasedUpgradeSlugs?: string[] }).purchasedUpgradeSlugs)
      ? (user as { purchasedUpgradeSlugs?: string[] }).purchasedUpgradeSlugs ?? []
      : []) as string[]),
    ...upgradePurchases.flatMap((row) => row.upgradeSlugs ?? []),
  ]);

  const activePlan = plans[0];
  const userAgreementAcknowledgedAt = (user as { userAgreementAcknowledgedAt?: Date | null })
    .userAgreementAcknowledgedAt;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/15 bg-black/30 p-4 text-sm text-white/90">
        <h3 className="text-base font-semibold text-emerald-100">{user.name}</h3>
        <p className="text-white/70">{user.email}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p>
            <span className="text-white/60">Active plan:</span>{" "}
            <span className="font-semibold">{activePlan ? activePlan.planName : "None"}</span>
          </p>
          <p>
            <span className="text-white/60">Paid upgrades:</span>{" "}
            {purchasedUpgradeSet.size > 0 ? [...purchasedUpgradeSet].sort().join(", ") : "None"}
          </p>
          <p>
            <span className="text-white/60">User agreement:</span>{" "}
            {userAgreementAcknowledgedAt
              ? `Acknowledged ${new Date(userAgreementAcknowledgedAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Not yet acknowledged"}
          </p>
          <p>
            <span className="text-white/60">Total listings:</span>{" "}
            <span className="font-semibold">{listings.length}</span>
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-100/80">
          Listings ({listings.length})
        </h4>
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-white/15 bg-black/30 p-4 text-sm text-white/70">
            No listings found for this user.
          </div>
        ) : (
          listings.map((listing) => {
            const listingKey = String(listing._id);
            const docs = docsByListing.get(listingKey) ?? [];
            const reqs = requestsByListing.get(listingKey) ?? [];
            return (
              <AdminListingDetailsCard
                key={listingKey}
                listing={listing as Parameters<typeof AdminListingDetailsCard>[0]["listing"]}
                documents={docs as Parameters<typeof AdminListingDetailsCard>[0]["documents"]}
                upgradeRequests={reqs as Parameters<typeof AdminListingDetailsCard>[0]["upgradeRequests"]}
              />
            );
          })
        )}
      </section>
    </div>
  );
}
