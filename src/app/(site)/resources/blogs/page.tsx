import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { blogs } from "@/data/blogs";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Read practical Texas home-selling guides on pricing, disclosures, and listing workflows.",
  alternates: {
    canonical: "/resources/blogs",
  },
};

export default function BlogsPage() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              RESOURCES · BLOGS
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Playbooks for analytical sellers.
            </h1>
            <p className="text-base text-muted">
              Practical guidance on pricing, compliance, and listing preparation.
            </p>
          </header>

          <div className="grid gap-4">
            {blogs.map((b) => (
              <Link
                key={b.slug}
                href={`/resources/blogs/${b.slug}`}
                className="glass-surface p-6 transition hover:border-white/20"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{b.category.toUpperCase()}</span>
                  <span className="text-xs font-mono text-white/50">
                    {b.publishedAt} · {b.readingMinutes} min
                  </span>
                </div>
                <div className="mt-3 text-lg font-semibold text-white">{b.title}</div>
                <div className="mt-2 text-sm text-muted">{b.summary}</div>
                <div className="mt-4 text-sm font-semibold text-white/80">
                  Open →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

