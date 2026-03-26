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
        "rounded-full px-3 py-2 text-sm font-semibold tracking-wide transition",
        active
          ? "text-white bg-white/10 border border-white/10"
          : "text-white/80 hover:text-white hover:bg-white/5",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

