import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogBody } from "@/components/blog/blog-body";
import { BlogStaticFallbackBody } from "@/components/blog/blog-static-fallback-body";
import { Container } from "@/components/container";
import {
  blogHtmlLang,
  blogOpenGraphLocale,
  blogPublicPath,
  buildBlogHreflangLanguages,
  getRequestBlogLocale,
} from "@/lib/blog-locale";
import { getBlogHreflangEntries, getPublishedBlogBySlug } from "@/lib/blog-service";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://listqik.com";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = await getRequestBlogLocale(lang);
  const post = await getPublishedBlogBySlug(slug, locale);
  if (!post) return {};

  const canonical = blogPublicPath(post.slug, post.locale);
  const hreflangEntries = await getBlogHreflangEntries(post);
  const languages = buildBlogHreflangLanguages(siteUrl, hreflangEntries);

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical,
      languages: Object.keys(languages).length > 1 ? languages : undefined,
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

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const locale = await getRequestBlogLocale(lang);
  const post = await getPublishedBlogBySlug(slug, locale);
  if (!post) return notFound();

  const hasBody = post.body.trim().length > 0;
  const htmlLang = blogHtmlLang(post.locale);

  return (
    <div className="py-10 sm:py-14" lang={htmlLang}>
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{post.category.toUpperCase()}</span>
              <span className="chip">{post.locale === "es" ? "ES" : "EN"}</span>
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
