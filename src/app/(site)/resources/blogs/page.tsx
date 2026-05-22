import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { getBlogsCopy } from "@/i18n/blogs-copy";
import { getRequestBlogLocale } from "@/lib/blog-locale";
import { listPublishedBlogs } from "@/lib/blog-service";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = await getRequestBlogLocale(lang);
  const copy = getBlogsCopy(locale);
  const canonical = locale === "es" ? "/resources/blogs?lang=es" : "/resources/blogs";

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical,
      languages: {
        "en-US": "/resources/blogs",
        "es-US": "/resources/blogs?lang=es",
        "x-default": "/resources/blogs",
      },
    },
    openGraph: {
      locale: locale === "es" ? "es_US" : "en_US",
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: canonical,
    },
  };
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = await getRequestBlogLocale(lang);
  const copy = getBlogsCopy(locale);
  const blogs = await listPublishedBlogs(locale);

  return (
    <div className="py-10 sm:py-14" lang={locale === "es" ? "es" : "en"}>
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              {copy.eyebrow}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {copy.title}
            </h1>
            <p className="text-base text-muted">{copy.subtitle}</p>
          </header>

          {blogs.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/65">
              {copy.empty}
            </p>
          ) : (
            <div className="grid gap-4">
              {blogs.map((b) => (
                <Link
                  key={`${b.locale}-${b.slug}`}
                  href={
                    b.locale === "es"
                      ? `/resources/blogs/${b.slug}?lang=es`
                      : `/resources/blogs/${b.slug}`
                  }
                  className="glass-surface p-6 transition hover:border-white/20"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip">{b.category.toUpperCase()}</span>
                    <span className="chip">{copy.localeChip[b.locale]}</span>
                    <span className="text-xs font-mono text-white/50">
                      {b.publishedAt} · {b.readingMinutes} min
                    </span>
                  </div>
                  <div className="mt-3 text-lg font-semibold text-white">{b.title}</div>
                  <div className="mt-2 text-sm text-muted">{b.summary}</div>
                  <div className="mt-4 text-sm font-semibold text-white/80">{copy.open}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
