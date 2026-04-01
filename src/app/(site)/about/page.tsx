import type { Metadata } from "next";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how ListQik.com and Resolution Realty Group help Texas sellers list faster with broker-backed guidance.",
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
              SYSTEM SPEC
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A fintech-grade FSBO stack for Texas.
            </h1>
            <p className="text-base text-muted">
              ListQik.com is positioned like a technical utility: precise workflow, measurable outcomes,
              and a UI that feels like a cockpit, not a brochure.
            </p>
          </header>

          <div className="glass-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">What we optimize for</h2>
            <ul className="mt-4 grid gap-3 text-sm text-white/80">
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Equity retained</div>
                <div className="mt-1 text-muted">
                  Reduce fee leakage. Keep proceeds. Show it with an interactive calculator.
                </div>
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Rapid deployment</div>
                <div className="mt-1 text-muted">
                  A launch pipeline designed for a 4-hour SLA: assets → compliance → publish.
                </div>
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Compliance without drama</div>
                <div className="mt-1 text-muted">
                  Broker-backed review plus AI-assisted audit hooks (phase-ready).
                </div>
              </li>
            </ul>
          </div>

          <div className="glass-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">Copy style (SaaS rebrand)</h2>
            <p className="mt-2 text-sm text-muted">
              You’ll see phrasing like “Deploy Listing”, “AI Compliance Audit”, and “Telemetry”.
              This is deliberate: it signals precision, speed, and control to the analytical demographic.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

