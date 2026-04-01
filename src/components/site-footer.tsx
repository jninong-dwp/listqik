import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold tracking-wide text-white">
              ListQik.com
            </div>
            <p className="text-sm text-muted">
              A technical utility for deploying listings fast while retaining
              more equity.
            </p>
            <div className="text-xs text-white/50 font-mono">
              Local Texas broker support · 4-hour rapid deployment
            </div>
            <div className="pt-2 text-xs text-white/60">
              <div className="font-semibold text-white/70">
                Resolution Realty Group
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Image
                  src="/central-metro-realty-logo.svg"
                  alt="Central Metro Realty"
                  width={160}
                  height={40}
                  className="h-8 w-auto opacity-90"
                  priority={false}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-widest text-white/70">
                Product
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link className="text-white/70 hover:text-white" href="/pricing">
                    Pricing
                  </Link>
                </li>
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
                    href="/resources/legal/iabs"
                  >
                    Information About Brokerage Services (IABS)
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-white/70 hover:text-white"
                    href="/resources/legal/consumer-protection-notice"
                  >
                    Consumer Protection Notice
                  </Link>
                </li>
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
          <div>
            © {new Date().getFullYear()} ListQik.com · Resolution Realty Group. All
            rights reserved.
          </div>
          <div className="font-mono">
            Status: <span className="text-white/70">Operational</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

