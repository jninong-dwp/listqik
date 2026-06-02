import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogBody } from "@/components/blog/blog-body";
import { BlogStaticFallbackBody } from "@/components/blog/blog-static-fallback-body";
import { Container } from "@/components/container";
import { blogOpenGraphLocale } from "@/lib/blog-locale";
import { getBlogHreflangEntries, getPublishedBlogBySlug } from "@/lib/blog-service";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://listqik.com";

function esBlogPath(slug: string): string {
  return `/es/resources/blogs/${slug}`;
}

function localizedBlogPath(slug: string, locale: "en" | "es"): string {
  return locale === "es" ? esBlogPath(slug) : `/resources/blogs/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = "es" as const;
  const post = await getPublishedBlogBySlug(slug, locale);
  if (!post) return {};

  const canonical = esBlogPath(post.slug);
  const hreflangEntries = await getBlogHreflangEntries(post);
  const languages: Record<string, string> = {};
  for (const entry of hreflangEntries) {
    const hreflang = entry.locale === "es" ? "es-US" : "en-US";
    languages[hreflang] = `${siteUrl}${localizedBlogPath(entry.slug, entry.locale)}`;
  }
  const en = hreflangEntries.find((e) => e.locale === "en");
  if (en) {
    languages["x-default"] = `${siteUrl}${localizedBlogPath(en.slug, "en")}`;
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical,
      languages: Object.keys(languages).length > 0 ? languages : undefined,
    },
    openGraph: {
      type: "article",
      locale: blogOpenGraphLocale(post.locale),
      title: post.title,
      description: post.summary,
      url: canonical,
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function EsBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = "es" as const;
  const post = await getPublishedBlogBySlug(slug, locale);
  if (!post) return notFound();

  const hasBody = post.body.trim().length > 0;

  return (
    <div className="py-10 sm:py-14" lang="es">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{post.category.toUpperCase()}</span>
              <span className="chip">ES</span>
              <span className="text-xs font-mono text-white/50">
                {post.publishedAt} · {post.readingMinutes} min
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-base text-muted">{post.summary}</p>
          </header>

          <article className="glass-surface space-y-4 p-6 sm:p-8">
            {hasBody ? (
              <BlogBody body={post.body} />
            ) : post.source === "static" ? (
              <BlogStaticFallbackBody />
            ) : (
              <BlogBody body="" />
            )}
          </article>
        </div>
      </Container>
    </div>
  );
}

