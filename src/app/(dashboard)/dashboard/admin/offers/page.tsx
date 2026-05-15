import Link from "next/link";
import { connectDb } from "@/lib/mongodb";
import { formatAdminDate, listingAddressShort } from "@/lib/admin-insights";
import { Listing } from "@/models/Listing";
import { ListingOffer } from "@/models/ListingOffer";
import { User } from "@/models/User";

export default async function AdminOffersPage() {
  await connectDb();
  const offers = await ListingOffer.find().sort({ createdAt: -1 }).lean();
  const listingIds = [...new Set(offers.map((o) => String(o.listingId)))];
  const listings = listingIds.length > 0 ? await Listing.find({ _id: { $in: listingIds } }).lean() : [];
  const listingById = new Map(listings.map((l) => [String(l._id), l]));
  const userIds = [...new Set(listings.map((l) => String(l.userId)))];
  const users = userIds.length > 0 ? await User.find({ _id: { $in: userIds } }).select("_id name email").lean() : [];
  const userById = new Map(users.map((u) => [String(u._id), u]));

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Offers</h2>
        <p className="mt-1 text-sm text-white/65">All buyer offers across listings.</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/30">
        <table className="min-w-full text-left text-sm text-white/90">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/70">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Buyer</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Listing</th>
              <th className="px-3 py-2">Seller</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const listing = listingById.get(String(offer.listingId));
              const owner = listing ? userById.get(String(listing.userId)) : undefined;
              return (
                <tr key={String(offer._id)} className="border-t border-white/10 align-top">
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{formatAdminDate(offer.createdAt)}</td>
                  <td className="px-3 py-2">
                    <p>{offer.buyerName}</p>
                    {offer.buyerEmail ? <p className="text-xs text-white/50">{offer.buyerEmail}</p> : null}
                  </td>
                  <td className="px-3 py-2 font-semibold">${offer.amount?.toLocaleString() ?? "—"}</td>
                  <td className="px-3 py-2">{offer.status}</td>
                  <td className="px-3 py-2 max-w-xs">
                    {listing ? listingAddressShort(listing) : <span className="text-white/50">Unknown listing</span>}
                  </td>
                  <td className="px-3 py-2">
                    {owner ? (
                      <Link className="text-emerald-300 underline" href={`/dashboard/admin/users/${String(owner._id)}`}>
                        {owner.name}
                      </Link>
                    ) : (
                      "—"
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
