import Link from "next/link";

const sections = [
  {
    href: "/dashboard/admin/listings",
    title: "Listings",
    description: "Browse every listing, owner, status, and plan label.",
  },
  {
    href: "/dashboard/admin/users",
    title: "Users",
    description: "Accounts, plans, upgrades, and profile shortcuts.",
  },
  {
    href: "/dashboard/admin/settings",
    title: "Settings",
    description: "How admin access is granted (environment configuration).",
  },
] as const;

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Overview</h2>
        <p className="mt-1 text-sm text-white/65">Choose a section from the sidebar or open a card below.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-2xl border border-white/10 bg-black/35 p-5 transition hover:border-emerald-400/35 hover:bg-emerald-950/20"
          >
            <h3 className="font-semibold text-emerald-100 group-hover:text-emerald-50">{s.title}</h3>
            <p className="mt-2 text-sm text-white/65">{s.description}</p>
            <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-emerald-400/90">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
