import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-emerald-500/25 bg-black/55 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-sm font-bold tracking-wide text-emerald-100">
            ListQik.com
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-emerald-200/80 sm:flex">
            <Link href="/resources/blogs" className="text-emerald-300/70 transition hover:text-emerald-200">
              Help Center
            </Link>
            <span className="font-semibold text-emerald-100">Listing Dashboard</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <details className="group relative">
              <summary className="list-none cursor-pointer rounded-full border border-emerald-400/30 bg-emerald-950/25 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:border-emerald-300/60 hover:bg-emerald-900/35">
                My Account
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-52 rounded-xl border border-emerald-500/25 bg-black/95 p-2 shadow-[0_12px_30px_rgba(2,6,3,0.5)]">
                <Link
                  href="/dashboard"
                  className="block rounded-lg px-3 py-2 text-sm text-emerald-100/90 transition hover:bg-emerald-900/35 hover:text-emerald-50"
                >
                  Listing Dashboard
                </Link>
                <button
                  type="button"
                  disabled
                  className="block w-full cursor-not-allowed rounded-lg px-3 py-2 text-left text-sm text-emerald-100/45"
                >
                  Orders (coming soon)
                </button>
                <button
                  type="button"
                  disabled
                  className="block w-full cursor-not-allowed rounded-lg px-3 py-2 text-left text-sm text-emerald-100/45"
                >
                  Profile/Password (coming soon)
                </button>
                <div className="mt-1 border-t border-emerald-500/20 pt-2">
                  <SignOutButton />
                </div>
              </div>
            </details>
            <Link
              href="/pricing"
              className="rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30"
            >
              List your home
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-balance bg-gradient-to-r from-lime-200 via-emerald-100 to-emerald-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          Listing dashboard preview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/75">
          Manage your MLS-ready listing details, status, and documents. This workspace is modeled after a broker seller
          portal (similar in spirit to ListWithFreedom.com).
        </p>
        <div className="mt-8">{children}</div>
      </div>
    </>
  );
}
