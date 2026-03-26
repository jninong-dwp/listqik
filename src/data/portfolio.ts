export type PortfolioItem = {
  category: string;
  title: string;
  summary: string;
  highlights: string[];
};

export const portfolioItems: PortfolioItem[] = [
  {
    category: "launch-systems",
    title: "Launch Systems",
    summary:
      "A deploy-first checklist: intake → compliance → publish → telemetry.",
    highlights: ["4-hour SLA workflow", "Asset QA gates", "Publish verification"],
  },
  {
    category: "compliance",
    title: "Compliance Automation",
    summary:
      "Phase-ready hooks for AI-assisted disclosure review and broker validation.",
    highlights: ["TREC-ready structure", "Audit trail design", "Risk flagging"],
  },
  {
    category: "attribution",
    title: "Attribution & Telemetry",
    summary:
      "UTM discipline + event capture designed to feed GoHighLevel attribution.",
    highlights: ["UTM naming conventions", "Pixel events", "Cross-site tracking"],
  },
];

