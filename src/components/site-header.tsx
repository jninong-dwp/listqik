import Link from "next/link";
import { Container } from "@/components/container";
import { NavLink } from "@/components/nav-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="group inline-flex items-center gap-2">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
            >
              <span className="font-mono text-xs font-bold tracking-widest text-white/90">
                LP
              </span>
            </span>
            <span className="text-sm font-semibold tracking-wide text-white">
              ListPath
            </span>
            <span className="chip hidden sm:inline-flex">FSBO Fintech</span>
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <NavLink href="/about">About</NavLink>
          <NavLink href="/listings">Listings</NavLink>
          <NavLink href="/portfolio/launch-systems">Portfolio</NavLink>
          <NavLink href="/resources/blogs">Resources</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/listings" className="btn-secondary hidden sm:inline-flex">
            View Listings
          </Link>
          <Link href="/resources/blogs" className="btn-primary">
            Deploy Listing
          </Link>
        </div>
      </Container>
    </header>
  );
}

