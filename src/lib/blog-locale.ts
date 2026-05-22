import { cookies } from "next/headers";
import { HOME_LOCALE_COOKIE_KEY, isHomeLocale } from "@/i18n/home-locale";

export { HOME_LOCALE_COOKIE_KEY };

export const BLOG_LOCALES = ["en", "es"] as const;
export type BlogLocale = (typeof BLOG_LOCALES)[number];

export function isBlogLocale(value: string | null | undefined): value is BlogLocale {
  return value === "en" || value === "es";
}

export function parseBlogLocale(value: unknown, fallback: BlogLocale = "en"): BlogLocale {
  return typeof value === "string" && isBlogLocale(value.trim().toLowerCase())
    ? (value.trim().toLowerCase() as BlogLocale)
    : fallback;
}

export async function getRequestBlogLocale(langParam?: string | null): Promise<BlogLocale> {
  if (isHomeLocale(langParam)) return langParam;
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(HOME_LOCALE_COOKIE_KEY)?.value;
  if (isHomeLocale(fromCookie)) return fromCookie;
  return "en";
}

/** Public blog URL; Spanish uses ?lang=es for SSR + SEO parity with site locale. */
export function blogPublicPath(slug: string, locale: BlogLocale): string {
  const base = `/resources/blogs/${slug}`;
  return locale === "es" ? `${base}?lang=es` : base;
}

export function blogOpenGraphLocale(locale: BlogLocale): string {
  return locale === "es" ? "es_US" : "en_US";
}

export function blogHtmlLang(locale: BlogLocale): string {
  return locale === "es" ? "es" : "en";
}

export type BlogHreflangEntry = { slug: string; locale: BlogLocale };

export function buildBlogHreflangLanguages(
  siteUrl: string,
  entries: BlogHreflangEntry[],
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const entry of entries) {
    const hreflang = entry.locale === "es" ? "es-US" : "en-US";
    languages[hreflang] = `${siteUrl}${blogPublicPath(entry.slug, entry.locale)}`;
  }
  const en = entries.find((e) => e.locale === "en");
  if (en) {
    languages["x-default"] = `${siteUrl}${blogPublicPath(en.slug, "en")}`;
  }
  return languages;
}
