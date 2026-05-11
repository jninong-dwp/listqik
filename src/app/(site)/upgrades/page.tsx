import type { Metadata } from "next";
import { Container } from "@/components/container";
import { UpgradesConsole } from "@/components/upgrades/upgrades-console";

export const metadata: Metadata = {
  title: "Listing Upgrades",
  description: "Browse and purchase optional listing upgrades.",
  alternates: {
    canonical: "/upgrades",
  },
};

export default function UpgradesPage() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <UpgradesConsole />
      </Container>
    </div>
  );
}
