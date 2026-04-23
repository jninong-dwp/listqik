import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Browse ListQik.com resources: blogs, videos, legal disclosures, and consumer notices for Texas sellers.",
  alternates: {
    canonical: "/resources",
  },
};

export default function ResourcesPage() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              RESOURCES HUB
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Documentation, playbooks, and media.
            </h1>
            <p className="text-base text-muted">
              Educational content, legal disclosures, and practical seller guidance for Texas listings.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/resources/blogs" className="glass-surface p-6 hover:border-white/20 transition">
              <div className="text-lg font-semibold text-white">Blogs</div>
              <div className="mt-2 text-sm text-muted">Playbooks, pricing, compliance, marketing.</div>
            </Link>
            <Link href="/resources/videos" className="glass-surface p-6 hover:border-white/20 transition">
              <div className="text-lg font-semibold text-white">Videos</div>
              <div className="mt-2 text-sm text-muted">YouTube embeds now; GHL video element later.</div>
            </Link>
            <Link href="/resources/legal/privacy" className="glass-surface p-6 hover:border-white/20 transition">
              <div className="text-lg font-semibold text-white">Privacy</div>
              <div className="mt-2 text-sm text-muted">Policy and data handling disclosures.</div>
            </Link>
            <Link href="/resources/legal/terms" className="glass-surface p-6 hover:border-white/20 transition">
              <div className="text-lg font-semibold text-white">Terms</div>
              <div className="mt-2 text-sm text-muted">Service terms and user responsibilities.</div>
            </Link>
            <Link href="/resources/legal/iabs" className="glass-surface p-6 hover:border-white/20 transition">
              <div className="text-lg font-semibold text-white">IABS</div>
              <div className="mt-2 text-sm text-muted">Information About Brokerage Services (Texas).</div>
            </Link>
            <Link
              href="/resources/legal/consumer-protection-notice"
              className="glass-surface p-6 hover:border-white/20 transition"
            >
              <div className="text-lg font-semibold text-white">Consumer Protection Notice</div>
              <div className="mt-2 text-sm text-muted">TREC consumer rights and resources.</div>
            </Link>
            <Link
              href="/resources/legal/mls-rule-schedule-of-fines"
              className="glass-surface p-6 hover:border-white/20 transition"
            >
              <div className="text-lg font-semibold text-white">MLS Rule Schedule of Fines</div>
              <div className="mt-2 text-sm text-muted">
                Administrative sanctions and fine amounts by MLS rule section.
              </div>
            </Link>
            <Link
              href="/resources/legal/mls-rules-and-regulations"
              className="glass-surface p-6 hover:border-white/20 transition"
            >
              <div className="text-lg font-semibold text-white">MLS Rules and Regulations</div>
              <div className="mt-2 text-sm text-muted">
                Full document text for Texas REALTORS MLS rules.
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

