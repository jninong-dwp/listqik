import Link from "next/link";
import { connectDb } from "@/lib/mongodb";
import {
  estimateSetupProgress,
  formatAdminDay,
  getListingBlockers,
  listingAddressShort,
} from "@/lib/admin-insights";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";
import { User } from "@/models/User";

const FILTERS = ["all", "stuck", "incomplete", "active", "pending"] as const;
type Filter = (typeof FILTERS)[number];

function parseFilter(raw: string | undefined): Filter {
  if (raw && FILTERS.includes(raw as Filter)) return raw as Filter;
  return "all";
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: filterRaw } = await searchParams;
  const filter = parseFilter(filterRaw);

  await connectDb();
  const [listings, users, documents] = await Promise.all([
    Listing.find().sort({ updatedAt: -1 }).lean(),
    User.find().select("_id email name").lean(),
    ListingDocument.find().select("listingId fileName").lean(),
  ]);

  const userById = new Map(users.map((u) => [String(u._id), u]));
  const docsByListing = new Map<string, string[]>();
  for (const doc of documents) {
    const key = String(doc.listingId);
    const bucket = docsByListing.get(key) ?? [];
    bucket.push(doc.fileName ?? "");
    docsByListing.set(key, bucket);
  }

  const rows = listings
    .map((listing) => {
      const blockers = getListingBlockers(listing, docsByListing.get(String(listing._id)) ?? []);
      const progress = estimateSetupProgress(listing);
      return { listing, blockers, progress, owner: userById.get(String(listing.userId)) };
    })
    .filter((row) => {
      if (filter === "all") return true;
      if (filter === "stuck") return row.blockers.length > 0 && row.listing.status === "INCOMPLETE";
      if (filter === "incomplete") return row.listing.status === "INCOMPLETE";
      if (filter === "active") return row.listing.status === "ACTIVE";
      if (filter === "pending") return row.listing.status === "PENDING";
      return true;
    });

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Listings</h2>
        <p className="mt-1 text-sm text-white/65">Setup progress and finalize blockers for every listing.</p>
      </header>

      <nav className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/dashboard/admin/listings" : `/dashboard/admin/listings?filter=${f}`}
            className={`rounded-full border px-3 py-1.5 ${
              filter === f
                ? "border-emerald-400/50 bg-emerald-950/40 text-emerald-100"
                : "border-white/15 text-white/60 hover:border-white/30"
            }`}
          >
            {f}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/30">
        <table className="min-w-full text-left text-sm text-white/90">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/70">
            <tr>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Setup</th>
              <th className="px-3 py-2">Blockers</th>
              <th className="px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ listing, blockers, progress, owner }) => (
              <tr key={String(listing._id)} className="border-t border-white/10 align-top">
                <td className="px-3 py-2 max-w-xs">
                  <p className="font-medium">{listingAddressShort(listing)}</p>
                  <p className="text-xs text-white/50">{listing.planLabel || "—"}</p>
                </td>
                <td className="px-3 py-2">
                  {owner ? (
                    <Link className="text-emerald-300 underline" href={`/dashboard/admin/users/${String(owner._id)}`}>
                      {owner.name}
                    </Link>
                  ) : (
                    <span className="text-white/50">Unknown</span>
                  )}
                </td>
                <td className="px-3 py-2">{listing.status}</td>
                <td className="px-3 py-2">
                  <span className="font-semibold text-emerald-200">{progress.pct}%</span>
                  <span className="text-white/50"> ({progress.completed}/{progress.total})</span>
                  {listing.setupFinalizedAt ? (
                    <p className="text-xs text-emerald-300/80">Finalized</p>
                  ) : null}
                </td>
                <td className="px-3 py-2 max-w-sm">
                  {blockers.length === 0 ? (
                    <span className="text-emerald-300/90">Ready</span>
                  ) : (
                    <ul className="list-disc pl-4 text-xs text-amber-100/85">
                      {blockers.slice(0, 3).map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                      {blockers.length > 3 ? <li>+{blockers.length - 3} more</li> : null}
                    </ul>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-white/55">
                  {formatAdminDay(listing.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
