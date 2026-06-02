import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { getBlogsCopy } from "@/i18n/blogs-copy";
import { listPublishedBlogs } from "@/lib/blog-service";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = "es" as const;
  const copy = getBlogsCopy(locale);
  const canonical = "/es/resources/blogs";

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical,
      languages: {
        "en-US": "/resources/blogs",
        "es-US": "/es/resources/blogs",
        "x-default": "/resources/blogs",
      },
    },
    openGraph: {
      locale: "es_US",
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: canonical,
    },
  };
}

export default async function EsBlogsPage() {
  const locale = "es" as const;
  const copy = getBlogsCopy(locale);
  const blogs = await listPublishedBlogs(locale);

  return (
    <div className="py-10 sm:py-14" lang="es">
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

          <div className="grid gap-3">
            {blogs.map((post) => (
              <Link
                key={`${post.locale}-${post.slug}`}
                href={`/es/resources/blogs/${post.slug}`}
                className="glass-surface block rounded-2xl p-5 transition hover:border-emerald-400/30"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{post.category.toUpperCase()}</span>
                  <span className="chip">ES</span>
                  <span className="text-xs font-mono text-white/50">
                    {post.publishedAt} · {post.readingMinutes} min
                  </span>
                </div>
                <div className="mt-3 text-lg font-semibold text-white">{post.title}</div>
                <p className="mt-1 text-sm text-muted">{post.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

