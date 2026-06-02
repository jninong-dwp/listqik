import type { Metadata } from "next";
import AboutPage from "../../../(site)/about/page";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how ListQik.com and Resolution Realty Group help Texas sellers list through a licensed brokerage with broker-backed guidance.",
  alternates: {
    canonical: "/es/about",
  },
};

export default function EsAboutPage() {
  return <AboutPage />;
}

