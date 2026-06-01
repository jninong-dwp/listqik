/**
 * Seed or update the "Discovering Texas counties" blog post in MongoDB.
 * Run: npm run db:seed-blog-texas-counties
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { discoveringTexasCountiesGuide as post } from "./blog-content/discovering-texas-counties-guide.mjs";

const root = path.resolve(import.meta.dirname, "..");

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
    translationOf: { type: String, default: null },
    title: String,
    summary: String,
    category: String,
    body: { type: String, default: "" },
    status: { type: String, default: "published" },
    publishedAt: Date,
    readingMinutes: Number,
    updatedByEmail: String,
  },
  { timestamps: true },
);

const BlogPost = mongoose.models.BlogPost ?? mongoose.model("BlogPost", schema);

await mongoose.connect(uri);

const result = await BlogPost.findOneAndUpdate(
  { slug: post.slug, locale: post.locale },
  {
    $set: {
      title: post.title,
      summary: post.summary,
      category: post.category,
      body: post.body,
      status: post.status,
      publishedAt: new Date(post.publishedAt),
      readingMinutes: post.readingMinutes,
    },
  },
  { upsert: true, new: true },
);

console.log(
  `Blog post ready: /resources/blogs/${result.slug} (${result.status}, ${result.readingMinutes} min read)`,
);

await mongoose.disconnect();
