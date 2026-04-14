import type { Metadata } from "next";
import { PricingConsole } from "@/components/pricing/pricing-console";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare ListQik.com pricing tiers for Texas broker-assisted listing services, including marketing support and licensed brokerage submission.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return <PricingConsole />;
}

