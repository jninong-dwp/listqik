import type { Metadata } from "next";
import { StartNowPageShell } from "@/components/marketing/start-now-page-shell";

export const metadata: Metadata = {
  title: "Start Now",
  description:
    "List smarter, sell faster, and close with confidence. Compare packages and start your Texas listing with ListQik.",
  alternates: {
    canonical: "/es/start-now",
  },
  openGraph: {
    title: "Start Now · ListQik",
    description:
      "Premium property presentation, MLS distribution, and broker-backed support for Texas home sellers.",
    url: "/es/start-now",
  },
};

export default function EsStartNowPage() {
  return <StartNowPageShell />;
}

