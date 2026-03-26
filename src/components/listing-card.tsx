import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/data/types";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group glass-surface overflow-hidden transition hover:border-white/20"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={listing.heroImage.src}
          alt={listing.heroImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          priority={Boolean(listing.featured)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="chip">{listing.status.toUpperCase()}</span>
          <span className="chip">{listing.type.replace("-", " ")}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold tracking-tight text-white">
              {listing.title}
            </div>
            <div className="mt-1 text-sm text-muted">
              {listing.city}, {listing.state}
              {listing.neighborhood ? ` · ${listing.neighborhood}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-white/50">Price</div>
            <div className="mt-1 font-mono text-sm font-semibold text-white">
              {formatMoney(listing.price)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {listing.tags.slice(0, 3).map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 text-sm text-white/75 line-clamp-2">
          {listing.summary}
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-white/60">
          <div className="font-mono">
            {listing.beds ? `${listing.beds} bd` : "—"} ·{" "}
            {listing.baths ? `${listing.baths} ba` : "—"} ·{" "}
            {listing.sqft ? `${listing.sqft.toLocaleString()} sqft` : "—"}
          </div>
          <div className="font-semibold text-white/80 group-hover:text-white">
            View details →
          </div>
        </div>
      </div>
    </Link>
  );
}

