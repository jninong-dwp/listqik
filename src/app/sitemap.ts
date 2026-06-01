import type { MetadataRoute } from "next";
import { blogPublicPath } from "@/lib/blog-locale";
import { listAllBlogSlugsForSitemap } from "@/lib/blog-service";
import { listings } from "@/data/listings";
import { portfolioItems } from "@/data/portfolio";
import { legalPages } from "@/data/resources";
import { allLocationSitemapPaths } from "@/lib/texas-location-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://listqik.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const blogEntries = await listAllBlogSlugsForSitemap();

  const staticRoutes = [
    "",
    "/about",
    "/pricing",
    "/start-now",
    "/listings",
    "/service-area",
    "/resources",
    "/resources/blogs",
    "/resources/blogs?lang=es",
    "/resources/videos",
    "/listqik-university",
  ];

  const listingRoutes = listings.map((l) => `/listings/${l.slug}`);
  const blogRoutes = blogEntries.map((entry) => blogPublicPath(entry.slug, entry.locale));
  const legalRoutes = legalPages.map((p) => `/resources/legal/${p.slug}`);
  const portfolioRoutes = Array.from(new Set(portfolioItems.map((p) => p.category))).map(
    (category) => `/portfolio/${category}`,
  );
  const locationRoutes = allLocationSitemapPaths();

  return [
    ...staticRoutes,
    ...listingRoutes,
    ...blogRoutes,
    ...legalRoutes,
    ...portfolioRoutes,
    ...locationRoutes,
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/listings/") ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/listings"
          ? 0.9
          : path.startsWith("/service-area/texas/")
            ? 0.55
            : path === "/service-area"
              ? 0.75
              : 0.7,
  }));
}
