import { Schema, model, models } from "mongoose";
import { BLOG_LOCALES, type BlogLocale } from "@/lib/blog-locale";

export const BLOG_CATEGORIES = ["playbooks", "compliance", "pricing", "marketing"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_STATUSES = ["draft", "published"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export type { BlogLocale };

const blogPostSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, lowercase: true },
    locale: { type: String, required: true, enum: BLOG_LOCALES, default: "en" },
    /** Slug of the paired post in the other language (for hreflang when slugs differ). */
    translationOf: { type: String, trim: true, lowercase: true, default: null },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: BLOG_CATEGORIES },
    body: { type: String, required: true, default: "" },
    status: { type: String, required: true, enum: BLOG_STATUSES, default: "draft" },
    publishedAt: { type: Date, default: null },
    readingMinutes: { type: Number, required: true, min: 1, default: 5 },
    updatedByEmail: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true },
);

blogPostSchema.index({ slug: 1, locale: 1 }, { unique: true });
blogPostSchema.index({ locale: 1, status: 1, publishedAt: -1 });

export const BlogPostModel = models.BlogPost ?? model("BlogPost", blogPostSchema);
