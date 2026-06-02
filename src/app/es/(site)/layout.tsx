import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteLocaleProvider } from "@/components/site-locale-provider";

export default function EsSiteLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SiteLocaleProvider>
        <SiteHeader />
        {children}
        <SiteFooter />
      </SiteLocaleProvider>
    </Suspense>
  );
}

