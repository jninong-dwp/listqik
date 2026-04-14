import type { BlogPost } from "./types";

export const blogs: BlogPost[] = [
  {
    slug: "deploy-listing-in-4-hours",
    title: "Deploy a Listing in 4 Hours: The Controller Workflow",
    publishedAt: "2026-03-01",
    readingMinutes: 6,
    category: "playbooks",
    summary:
      "A step-by-step deployment checklist: assets, broker-assisted listing pipeline, compliance checks, and launch QA.",
  },
  {
    slug: "trec-disclosures-zero-drama",
    title: "TREC Disclosures, Zero Drama: A Practical Compliance Audit",
    publishedAt: "2026-02-12",
    readingMinutes: 8,
    category: "compliance",
    summary:
      "What breaks deals in Texas disclosures, and how to run a clean, repeatable audit.",
  },
  {
    slug: "pricing-like-a-quant",
    title: "Pricing Like a Quant: Why the First 7 Days Decide Everything",
    publishedAt: "2026-01-25",
    readingMinutes: 7,
    category: "pricing",
    summary:
      "A numbers-first pricing model you can run without guesswork, plus a calibration loop.",
  },
];

