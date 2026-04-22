import Link from "next/link";
import { Container } from "@/components/container";
import { NavLink } from "@/components/nav-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-500/25 bg-black/55 backdrop-blur">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent"
      />
      <Container className="flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="group inline-flex items-center gap-2">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/35 bg-emerald-950/35 shadow-[0_0_14px_rgba(16,185,129,0.2)]"
            >
              <span className="font-mono text-xs font-bold tracking-widest text-emerald-200">LQ</span>
            </span>
            <span className="text-sm font-semibold tracking-wide text-emerald-100">ListQik.com</span>
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/listings">Listings</NavLink>
          <NavLink href="/portfolio/launch-systems">Portfolio</NavLink>
          <NavLink href="/resources/blogs">Resources</NavLink>
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/login"
            className="hidden min-h-[40px] items-center rounded-full border border-emerald-400/25 px-3 text-sm font-semibold tracking-wide text-emerald-100/90 transition hover:border-emerald-300/50 sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="hidden min-h-[40px] items-center rounded-full border border-emerald-400/35 bg-emerald-950/30 px-3 text-sm font-semibold tracking-wide text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-900/35 sm:inline-flex"
          >
            Dashboard
          </Link>
          <Link
            href="/listings"
            className="hidden min-h-[40px] items-center rounded-full border border-emerald-400/35 bg-emerald-950/30 px-4 text-sm font-semibold tracking-wide text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-900/35 lg:inline-flex"
          >
            View Listings
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-[40px] items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 text-sm font-semibold tracking-wide text-emerald-100 transition hover:bg-emerald-400/30"
          >
            Start Listing
          </Link>
        </div>
      </Container>
    </header>
  );
}
