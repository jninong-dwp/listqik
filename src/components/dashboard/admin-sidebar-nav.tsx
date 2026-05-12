"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavItem = {
  href: string;
  label: string;
  /** Match pathname exactly (e.g. overview home). */
  exact?: boolean;
};

function linkActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="mt-4 flex flex-col gap-0.5" aria-label="Admin sections">
      {items.map((item) => {
        const active = linkActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active
                ? "border border-emerald-400/35 bg-emerald-500/15 text-emerald-50 shadow-[inset_3px_0_0_0_rgba(52,211,153,0.85)]"
                : "border border-transparent text-emerald-100/75 hover:border-white/10 hover:bg-white/5 hover:text-emerald-50",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
