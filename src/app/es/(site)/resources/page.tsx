import type { Metadata } from "next";
import ResourcesPage from "../../../(site)/resources/page";

export const metadata: Metadata = {
  title: "Resources",
  description: "Browse ListQik resources, guides, and learning materials.",
  alternates: {
    canonical: "/es/resources",
  },
};

export default function EsResourcesPage() {
  return <ResourcesPage />;
}

