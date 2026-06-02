import type { Metadata } from "next";
import UniversityPage from "../../../(site)/listqik-university/page";

export const metadata: Metadata = {
  title: "ListQik University",
  description: "Guided videos and learning resources for listing successfully in Texas.",
  alternates: {
    canonical: "/es/listqik-university",
  },
};

export default function EsListQikUniversityPage() {
  return <UniversityPage />;
}

