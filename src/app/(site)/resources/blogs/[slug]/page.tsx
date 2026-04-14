import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { blogs } from "@/data/blogs";

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `/resources/blogs/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `/resources/blogs/${post.slug}`,
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);
  if (!post) return notFound();

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{post.category.toUpperCase()}</span>
              <span className="text-xs font-mono text-white/50">
                {post.publishedAt} · {post.readingMinutes} min
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-base text-muted">{post.summary}</p>
          </header>

          <article className="glass-surface p-6 sm:p-8 space-y-4 text-sm text-white/80">
            <p>
              This article summarizes a practical workflow for Texas sellers preparing to list through a
              licensed brokerage.
            </p>
            <p>
              Use these steps to organize disclosures, streamline review, and improve listing launch quality.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold tracking-widest text-white/60">
                CONTROLLER CHECKLIST
              </div>
              <ul className="mt-3 grid gap-2">
                <li>Confirm asset integrity (photos, specs, disclosures).</li>
                <li>Run compliance audit (TREC + broker validation).</li>
                <li>Launch listing + verify links, tracking, and calls-to-action.</li>
              </ul>
            </div>
          </article>
        </div>
      </Container>
    </div>
  );
}

