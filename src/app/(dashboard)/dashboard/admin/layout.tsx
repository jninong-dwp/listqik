import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AdminSidebarNav } from "@/components/dashboard/admin-sidebar-nav";
import { authOptions } from "@/lib/auth-options";
import { isAdminEmail } from "@/lib/admin";

const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Overview", exact: true as const },
  { href: "/dashboard/admin/purchases", label: "Purchases" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/listings", label: "Listings" },
  { href: "/dashboard/admin/documents", label: "Documents" },
  { href: "/dashboard/admin/offers", label: "Offers" },
  { href: "/dashboard/admin/upgrade-requests", label: "Upgrade requests" },
  { href: "/dashboard/admin/checkouts", label: "Checkouts" },
  { href: "/dashboard/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/admin");
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <aside className="w-full shrink-0 lg:w-56 xl:w-60">
        <div className="rounded-2xl border border-emerald-500/25 bg-black/45 p-4 shadow-[0_8px_40px_rgba(2,6,3,0.35)] lg:sticky lg:top-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/75">Navigation</p>
          <p className="mt-2 text-sm font-semibold text-emerald-50">Admin console</p>
          <p className="mt-1 text-xs leading-relaxed text-white/55">
            Users, listings, and tools for platform operators.
          </p>
          <AdminSidebarNav items={NAV_ITEMS} />
        </div>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
