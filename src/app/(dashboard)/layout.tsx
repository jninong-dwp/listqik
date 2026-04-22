import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Listing Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),rgba(2,6,3,0.95)_55%)] text-emerald-100 antialiased">
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
