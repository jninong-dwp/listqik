import Link from "next/link";

export function LocationSeoCta() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/pricing"
        className="inline-flex min-h-[44px] items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-5 text-sm font-semibold tracking-wide text-emerald-100 transition hover:bg-emerald-400/30"
      >
        Start Listing
      </Link>
      <Link
        href="/service-area"
        className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
      >
        Service area overview
      </Link>
      <a
        href="mailto:concierge@listqik.com?subject=Service%20Area%20Question"
        className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
      >
        Contact Concierge
      </a>
    </div>
  );
}
