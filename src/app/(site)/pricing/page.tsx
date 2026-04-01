import type { Metadata } from "next";
import { PricingConsole } from "@/components/pricing/pricing-console";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare ListQik.com pricing tiers for Texas MLS listing services. Plans start at $99 with broker-backed compliance support.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return <PricingConsole />;
}

