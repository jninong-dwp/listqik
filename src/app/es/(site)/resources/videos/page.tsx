import type { Metadata } from "next";
import VideosPage from "../../../../(site)/resources/videos/page";

export const metadata: Metadata = {
  title: "Videos",
  description: "Watch videos on listing workflows, compliance, and selling strategies.",
  alternates: {
    canonical: "/es/resources/videos",
  },
};

export default function EsVideosPage() {
  return <VideosPage />;
}

