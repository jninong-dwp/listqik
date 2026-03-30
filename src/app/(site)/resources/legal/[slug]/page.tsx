import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { legalPages } from "@/data/resources";

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) return notFound();

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              RESOURCES · LEGAL
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {page.title}
            </h1>
            <p className="text-sm text-muted">
              Updated: <span className="font-mono text-white/70">{page.updatedAt}</span>
            </p>
          </header>

          <article className="glass-surface p-6 sm:p-8 space-y-4 text-sm text-white/80">
            <p>
              Placeholder legal text. Replace this content with your attorney-approved copy before production.
            </p>
            <p className="text-muted">
              Implementation note: keep legal routes stable for SEO and backlink durability.
            </p>
          </article>
        </div>
      </Container>
    </div>
  );
}

