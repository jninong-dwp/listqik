import Link from "next/link";
import { connectDb } from "@/lib/mongodb";
import { formatAdminDate, listingAddressShort } from "@/lib/admin-insights";
import { Listing } from "@/models/Listing";
import { ListingDocument } from "@/models/ListingDocument";
import { User } from "@/models/User";

export default async function AdminDocumentsPage() {
  await connectDb();
  const documents = await ListingDocument.find().sort({ createdAt: -1 }).lean();
  const listingIds = [...new Set(documents.map((d) => String(d.listingId)))];
  const listings = listingIds.length > 0 ? await Listing.find({ _id: { $in: listingIds } }).lean() : [];
  const listingById = new Map(listings.map((l) => [String(l._id), l]));
  const userIds = [...new Set(listings.map((l) => String(l.userId)))];
  const users = userIds.length > 0 ? await User.find({ _id: { $in: userIds } }).select("_id name email").lean() : [];
  const userById = new Map(users.map((u) => [String(u._id), u]));

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Documents</h2>
        <p className="mt-1 text-sm text-white/65">Uploaded and generated listing documents.</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/30">
        <table className="min-w-full text-left text-sm text-white/90">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/70">
            <tr>
              <th className="px-3 py-2">Uploaded</th>
              <th className="px-3 py-2">File</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Signature</th>
              <th className="px-3 py-2">Listing</th>
              <th className="px-3 py-2">Seller</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const listing = listingById.get(String(doc.listingId));
              const owner = listing ? userById.get(String(listing.userId)) : undefined;
              return (
                <tr key={String(doc._id)} className="border-t border-white/10 align-top">
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{formatAdminDate(doc.createdAt)}</td>
                  <td className="px-3 py-2">
                    <a className="text-emerald-300 underline" href={doc.fileUrl} target="_blank" rel="noreferrer">
                      {doc.fileName}
                    </a>
                  </td>
                  <td className="px-3 py-2">{doc.documentType || "UPLOAD"}</td>
                  <td className="px-3 py-2 text-xs">{doc.signatureStatus ?? "—"}</td>
                  <td className="px-3 py-2 max-w-xs">
                    {listing ? listingAddressShort(listing) : <span className="text-white/50">Unknown</span>}
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
