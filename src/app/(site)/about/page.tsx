import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how ListQik.com and Resolution Realty Group help Texas sellers list through a licensed brokerage with broker-backed guidance.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              ABOUT LISTQIK
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A simpler way to list your Texas home.
            </h1>
            <p className="text-base text-muted">
              ListQik.com helps homeowners list with clear steps, broker-backed support, and tools
              that make each part of the process easier to understand.
            </p>
          </header>

          <div className="glass-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">What we optimize for</h2>
            <ul className="mt-4 grid gap-3 text-sm text-white/80">
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Keep more from your sale</div>
                <div className="mt-1 text-muted">
                  Compare fee scenarios and estimate what you may keep with the built-in calculator.
                </div>
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Faster setup</div>
                <div className="mt-1 text-muted">
                  Move from listing details to review and publish in a guided flow.
                </div>
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Clear compliance support</div>
                <div className="mt-1 text-muted">
                  Your listing goes through broker-backed review to help avoid common issues.
                </div>
              </li>
            </ul>
          </div>

          <div className="glass-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">Our writing style</h2>
            <p className="mt-2 text-sm text-muted">
              We use simple, direct wording so homeowners can quickly understand what to do next.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

