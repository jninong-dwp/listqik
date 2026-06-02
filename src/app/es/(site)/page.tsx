import type { Metadata } from "next";
import { HomePageShell } from "@/components/home/home-page-shell";

export const metadata: Metadata = {
  title: "ListQik.com | Texas Home Listing Platform",
  description:
    "List your Texas home with a guided workflow, broker-backed support, and tools built to help you keep more equity.",
  alternates: {
    canonical: "/es",
  },
};

export default function EsHomePage() {
  return <HomePageShell />;
}

