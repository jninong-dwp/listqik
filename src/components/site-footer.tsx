import Link from "next/link";
import { Container } from "@/components/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold tracking-wide text-white">
              ListPath
            </div>
            <p className="text-sm text-muted">
              A technical utility for deploying listings fast while retaining
              more equity.
            </p>
            <div className="text-xs text-white/50 font-mono">
              Local Texas broker support · 4-hour rapid deployment
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-widest text-white/70">
                Product
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link className="text-white/70 hover:text-white" href="/listings">
                    Listings
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white/70 hover:text-white"
                    href="/portfolio/launch-systems"
                  >
                    Portfolio
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-widest text-white/70">
                Resources
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    className="text-white/70 hover:text-white"
                    href="/resources/blogs"
                  >
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white/70 hover:text-white"
                    href="/resources/videos"
                  >
                    Videos
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-widest text-white/70">
                Legal
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    className="text-white/70 hover:text-white"
                    href="/resources/legal/privacy"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white/70 hover:text-white"
                    href="/resources/legal/terms"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} ListPath. All rights reserved.</div>
          <div className="font-mono">
            Status: <span className="text-white/70">Operational</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

