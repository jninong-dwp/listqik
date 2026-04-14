import type { Metadata } from "next";
import { Container } from "@/components/container";
import { ListingsExplorer } from "@/components/listings-explorer";
import { listings } from "@/data/listings";

export const metadata: Metadata = {
  title: "Listings",
  description:
    "Browse Texas home listings on ListQik.com with local broker-backed support from Resolution Realty Group.",
  alternates: {
    canonical: "/listings",
  },
};

export default function ListingsPage() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="space-y-3">
          <div className="text-xs font-semibold tracking-widest text-white/60">
            LISTINGS INDEX
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Browse inventory. Filter locally.
          </h1>
          <p className="text-base text-muted">
            Review active home listings with local market context and broker-backed support options.
          </p>
        </div>

        <div className="mt-8">
          <ListingsExplorer listings={listings} />
        </div>
      </Container>
    </div>
  );
}

