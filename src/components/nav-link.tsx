"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "rounded-full border px-3 py-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] transition",
        active
          ? "border-emerald-300/70 bg-emerald-400/20 text-emerald-100 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
          : "border-transparent text-emerald-100/85 hover:border-emerald-400/35 hover:bg-emerald-900/25 hover:text-emerald-100",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

