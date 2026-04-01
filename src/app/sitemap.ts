import type { MetadataRoute } from "next";
import { blogs } from "@/data/blogs";
import { listings } from "@/data/listings";
import { portfolioItems } from "@/data/portfolio";
import { legalPages } from "@/data/resources";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://listqik.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/pricing",
    "/listings",
    "/resources",
    "/resources/blogs",
    "/resources/videos",
  ];

  const listingRoutes = listings.map((l) => `/listings/${l.slug}`);
  const blogRoutes = blogs.map((b) => `/resources/blogs/${b.slug}`);
  const legalRoutes = legalPages.map((p) => `/resources/legal/${p.slug}`);
  const portfolioRoutes = Array.from(new Set(portfolioItems.map((p) => p.category))).map(
    (category) => `/portfolio/${category}`,
  );

  return [
    ...staticRoutes,
    ...listingRoutes,
    ...blogRoutes,
    ...legalRoutes,
    ...portfolioRoutes,
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/listings/") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/listings" ? 0.9 : 0.7,
  }));
}

