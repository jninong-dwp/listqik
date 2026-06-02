import type { Metadata } from "next";
import ListingsPage from "../../../(site)/listings/page";

export const metadata: Metadata = {
  title: "Listings",
  description: "Browse active ListQik listings across Texas markets.",
  alternates: {
    canonical: "/es/listings",
  },
};

export default function EsListingsPage() {
  return <ListingsPage />;
}

