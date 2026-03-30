import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { portfolioItems } from "@/data/portfolio";

export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const items = portfolioItems.filter((p) => p.category === category);
  const title = items[0]?.title;
  if (!title) return notFound();

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              PORTFOLIO
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="text-base text-muted">
              Category slug route:{" "}
              <span className="font-mono text-white/70">/portfolio/{category}</span>
            </p>
          </header>

          <div className="glass-surface p-6 sm:p-8">
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it.summary}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="text-lg font-semibold text-white">{it.title}</div>
                  <div className="mt-2 text-sm text-muted">{it.summary}</div>
                  <ul className="mt-4 grid gap-2 text-sm text-white/80">
                    {it.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className="mt-1 h-2 w-2 rounded-full bg-[color:var(--lp-accent)]"
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

