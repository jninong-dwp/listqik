"use client";

import { useMemo, useState } from "react";
import type { Listing } from "@/data/types";
import { ListingCard } from "@/components/listing-card";

type SortKey = "featured" | "price-asc" | "price-desc" | "city";

export function ListingsExplorer({ listings }: { listings: Listing[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Listing["status"]>("all");
  const [city, setCity] = useState<"all" | string>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const l of listings) set.add(l.city);
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))] as const;
  }, [listings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = listings.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (city !== "all" && l.city !== city) return false;
      if (!q) return true;
      const hay = [
        l.title,
        l.city,
        l.neighborhood ?? "",
        l.type,
        l.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    const sorted = [...base];
    sorted.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "city") return a.city.localeCompare(b.city) || a.title.localeCompare(b.title);

      // featured
      const af = a.featured ? 1 : 0;
      const bf = b.featured ? 1 : 0;
      if (bf !== af) return bf - af;
      return a.price - b.price;
    });

    return sorted;
  }, [city, listings, query, sort, status]);

  return (
    <div className="space-y-6">
      <div className="glass-surface p-5 sm:p-6">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold tracking-widest text-white/60">
              SEARCH
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Austin, 78704, condo, walkable…"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-widest text-white/60">
              STATUS
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-widest text-white/60">
              CITY
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-white/60 font-mono">
            Results: <span className="text-white/80">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold tracking-widest text-white/60">
              SORT
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none focus:border-white/20"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="city">City</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-surface p-8 text-center">
          <div className="text-lg font-semibold text-white">No matches.</div>
          <div className="mt-2 text-sm text-muted">
            Try clearing filters or broadening your search terms.
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingCard key={l.slug} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

