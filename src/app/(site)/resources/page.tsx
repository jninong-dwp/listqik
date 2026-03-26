import Link from "next/link";
import { Container } from "@/components/container";

export const metadata = {
  title: "Resources",
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
              Everything here is designed to later connect into GoHighLevel tracking and attribution.
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
              <div className="mt-2 text-sm text-muted">Placeholder policy page.</div>
            </Link>
            <Link href="/resources/legal/terms" className="glass-surface p-6 hover:border-white/20 transition">
              <div className="text-lg font-semibold text-white">Terms</div>
              <div className="mt-2 text-sm text-muted">Placeholder terms page.</div>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

