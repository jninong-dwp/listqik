import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { blogs } from "@/data/blogs";

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
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
              This is a placeholder body rendered from static metadata. When you
              add a CMS later, keep the route shape and replace the datasource.
            </p>
            <p>
              Suggested structure: problem → constraints → workflow → checklist →
              failure modes → QA.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs font-semibold tracking-widest text-white/60">
                CONTROLLER CHECKLIST
              </div>
              <ul className="mt-3 grid gap-2">
                <li>Confirm asset integrity (photos, specs, disclosures).</li>
                <li>Run compliance audit (TREC + broker validation).</li>
                <li>Deploy listing + verify links, tracking, and calls-to-action.</li>
              </ul>
            </div>
          </article>
        </div>
      </Container>
    </div>
  );
}

