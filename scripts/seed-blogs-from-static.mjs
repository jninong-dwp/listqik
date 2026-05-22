/**
 * One-time seed: copy static blog metadata into MongoDB as published posts.
 * Run: npm run db:seed-blogs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const root = path.resolve(import.meta.dirname, "..");

const STATIC_BLOGS = [
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

function loadEnvLocal() {
  try {
    const raw = readFileSync(path.join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* no .env.local */
  }
}

loadEnvLocal();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required.");
  process.exit(1);
}

const schema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    locale: { type: String, required: true, default: "en" },
    title: String,
    summary: String,
    category: String,
    body: { type: String, default: "" },
    status: { type: String, default: "published" },
    publishedAt: Date,
    readingMinutes: Number,
  },
  { timestamps: true },
);

const BlogPost = mongoose.models.BlogPost ?? mongoose.model("BlogPost", schema);

await mongoose.connect(uri);

let created = 0;
let skipped = 0;

for (const post of STATIC_BLOGS) {
  const exists = await BlogPost.findOne({ slug: post.slug, locale: "en" }).lean();
  if (exists) {
    skipped++;
    continue;
  }
  await BlogPost.create({
    slug: post.slug,
    locale: "en",
    title: post.title,
    summary: post.summary,
    category: post.category,
    body: "",
    status: "published",
    publishedAt: new Date(post.publishedAt),
    readingMinutes: post.readingMinutes,
  });
  created++;
}

console.log(`Done. Created ${created}, skipped ${skipped} (already in DB).`);
await mongoose.disconnect();
