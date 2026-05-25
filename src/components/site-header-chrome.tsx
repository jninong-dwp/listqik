"use client";

import Link from "next/link";
import { HeaderSignOutButton } from "@/components/auth/header-sign-out-button";
import { Container } from "@/components/container";
import { NavLink } from "@/components/nav-link";
import { useSiteLocale } from "@/components/site-locale-provider";

type SiteHeaderChromeProps = {
  isAuthenticated: boolean;
};

export function SiteHeaderChrome({ isAuthenticated }: SiteHeaderChromeProps) {
  const { chrome, ready } = useSiteLocale();
  const t = chrome.header;

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
              <span className="font-mono text-xs font-bold tracking-widest text-emerald-200">
                LQ
              </span>
            </span>
            <span className="text-sm font-semibold tracking-wide text-emerald-100">
              ListQik.com
            </span>
          </Link>
        </div>

        <nav
          aria-label={ready ? t.navLabel : "Primary"}
          className="hidden items-center gap-1 md:flex"
        >
          <NavLink href="/pricing">{ready ? t.pricing : "Pricing"}</NavLink>
          <NavLink href="/about">{ready ? t.about : "About"}</NavLink>
          <NavLink href="/service-area">
            {ready ? t.serviceArea : "Service Area"}
          </NavLink>
          <NavLink href="/listqik-university">
            {ready ? t.university : "University"}
          </NavLink>
          <NavLink href="/resources/blogs">
            {ready ? t.resources : "Resources"}
          </NavLink>
        </nav>

        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="hidden min-h-[40px] items-center rounded-full border border-emerald-400/35 bg-emerald-950/30 px-3 text-sm font-semibold tracking-wide text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-900/35 sm:inline-flex"
              >
                {ready ? t.dashboard : "Dashboard"}
              </Link>
              <HeaderSignOutButton label={ready ? t.logOut : "Log out"} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden min-h-[40px] items-center rounded-full border border-emerald-400/25 px-3 text-sm font-semibold tracking-wide text-emerald-100/90 transition hover:border-emerald-300/50 sm:inline-flex"
              >
                {ready ? t.logIn : "Log in"}
              </Link>
              <Link
                href="/listings"
                className="hidden min-h-[40px] items-center rounded-full border border-emerald-400/35 bg-emerald-950/30 px-4 text-sm font-semibold tracking-wide text-emerald-100 transition hover:border-emerald-300/70 hover:bg-emerald-900/35 lg:inline-flex"
              >
                {ready ? t.viewListings : "View Listings"}
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[40px] items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 text-sm font-semibold tracking-wide text-emerald-100 transition hover:bg-emerald-400/30"
              >
                {ready ? t.startListing : "Start Listing"}
              </Link>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
