import type { Metadata } from "next";
import UpgradesPage from "../../../(site)/upgrades/page";

export const metadata: Metadata = {
  title: "Listing Upgrades",
  description: "Browse and purchase optional listing upgrades.",
  alternates: {
    canonical: "/es/upgrades",
  },
};

export default function EsUpgradesPage() {
  return <UpgradesPage />;
}

