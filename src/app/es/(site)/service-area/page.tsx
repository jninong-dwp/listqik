import type { Metadata } from "next";
import ServiceAreaPage from "../../../(site)/service-area/page";

export const metadata: Metadata = {
  title: "Service Area",
  description:
    "See ListQik's current Texas service coverage, including primary DFW counties, extended Texas county support, and Houston HAR market reference counties.",
  alternates: {
    canonical: "/es/service-area",
  },
};

export default function EsServiceAreaPage() {
  return <ServiceAreaPage />;
}

