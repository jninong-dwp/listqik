import { revalidatePath } from "next/cache";
import { blogs as staticBlogs } from "@/data/blogs";
import type { BlogPost as StaticBlogPost } from "@/data/types";
import {
  blogPublicPath,
  parseBlogLocale,
  type BlogLocale,
} from "@/lib/blog-locale";
import { estimateReadingMinutes, slugifyBlogTitle } from "@/lib/blog-slug";
import { connectDb } from "@/lib/mongodb";
import {
  BLOG_CATEGORIES,
  BlogPostModel,
  type BlogCategory,
  type BlogStatus,
} from "@/models/BlogPost";

export type PublicBlogPost = {
  slug: string;
  locale: BlogLocale;
  translationOf: string | null;
  title: string;
  summary: string;
  category: BlogCategory;
  publishedAt: string;
  readingMinutes: number;
  body: string;
  source: "database" | "static";
};

export type AdminBlogPost = PublicBlogPost & {
  status: BlogStatus;
  updatedAt: string | null;
  createdAt: string | null;
  updatedByEmail: string | null;
};

export type BlogSitemapEntry = { slug: string; locale: BlogLocale };

function toIsoDate(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function docToPublic(doc: {
  slug: string;
  locale?: string;
  translationOf?: string | null;
  title: string;
  summary: string;
  category: BlogCategory;
  body: string;
  publishedAt?: Date | null;
  readingMinutes: number;
}): PublicBlogPost {
  return {
    slug: doc.slug,
    locale: parseBlogLocale(doc.locale),
    translationOf: doc.translationOf?.trim() || null,
    title: doc.title,
    summary: doc.summary,
    category: doc.category,
    publishedAt: toIsoDate(doc.publishedAt),
    readingMinutes: doc.readingMinutes,
    body: doc.body,
    source: "database",
  };
}

function docToAdmin(doc: {
  slug: string;
  locale?: string;
  translationOf?: string | null;
  title: string;
  summary: string;
  category: BlogCategory;
  body: string;
  status: BlogStatus;
  publishedAt?: Date | null;
  readingMinutes: number;
  updatedByEmail?: string | null;
  updatedAt?: Date;
  createdAt?: Date;
}): AdminBlogPost {
  return {
    ...docToPublic(doc),
    status: doc.status,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedByEmail: doc.updatedByEmail ?? null,
  };
}

function staticToPublic(post: StaticBlogPost): PublicBlogPost {
  return {
    slug: post.slug,
    locale: "en",
    translationOf: null,
    title: post.title,
    summary: post.summary,
    category: post.category as BlogCategory,
    publishedAt: post.publishedAt,
    readingMinutes: post.readingMinutes,
    body: "",
    source: "static",
  };
}

function revalidateBlogPaths(slug?: string, locale?: BlogLocale) {
  revalidatePath("/resources/blogs");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/resources/blogs/${slug}`);
    if (locale === "es") revalidatePath(`/resources/blogs/${slug}`, "page");
  }
}

async function withBlogDb<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    await connectDb();
    return await run();
  } catch {
    return fallback;
  }
}

export async function listPublishedBlogs(locale: BlogLocale): Promise<PublicBlogPost[]> {
  return withBlogDb(
    async () => {
      const docs = await BlogPostModel.find({ status: "published", locale })
        .sort({ publishedAt: -1, updatedAt: -1 })
        .lean();

      if (docs.length > 0) {
        return docs.map((doc) =>
          docToPublic(doc as Parameters<typeof docToPublic>[0]),
        );
      }

      if (locale === "en") return staticBlogs.map(staticToPublic);
      return [];
    },
    locale === "en" ? staticBlogs.map(staticToPublic) : [],
  );
}

export async function getPublishedBlogBySlug(
  slug: string,
  locale: BlogLocale,
): Promise<PublicBlogPost | null> {
  const staticMatch = locale === "en" ? staticBlogs.find((b) => b.slug === slug) : null;
  const staticFallback = staticMatch ? staticToPublic(staticMatch) : null;

  return withBlogDb(
    async () => {
      const doc = await BlogPostModel.findOne({ slug, locale, status: "published" }).lean();
      if (doc) {
        return docToPublic(doc as Parameters<typeof docToPublic>[0]);
      }
      return staticFallback;
    },
    staticFallback,
  );
}

/** Resolve hreflang pairs: same slug in other locale, or via translationOf. */
export async function getBlogHreflangEntries(
  post: PublicBlogPost,
): Promise<{ slug: string; locale: BlogLocale }[]> {
  const entries: { slug: string; locale: BlogLocale }[] = [
    { slug: post.slug, locale: post.locale },
  ];
  const otherLocale: BlogLocale = post.locale === "es" ? "en" : "es";

  try {
    await connectDb();

    const sameSlugOther = await BlogPostModel.findOne({
      slug: post.slug,
      locale: otherLocale,
      status: "published",
    })
      .select("slug locale")
      .lean();

    if (sameSlugOther) {
      entries.push({ slug: sameSlugOther.slug, locale: otherLocale });
    } else {
      if (post.translationOf) {
        const linked = await BlogPostModel.findOne({
          slug: post.translationOf,
          locale: otherLocale,
          status: "published",
        })
          .select("slug locale")
          .lean();
        if (linked) {
          entries.push({ slug: linked.slug, locale: otherLocale });
        }
      }
      const reverse = await BlogPostModel.findOne({
        translationOf: post.slug,
        locale: otherLocale,
        status: "published",
      })
        .select("slug locale")
        .lean();
      if (reverse) {
        entries.push({ slug: reverse.slug, locale: otherLocale });
      }
    }
  } catch {
    /* single-language metadata still works */
  }

  const seen = new Set<string>();
  return entries.filter((e) => {
    const key = `${e.locale}:${e.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function listAllBlogSlugsForSitemap(): Promise<BlogSitemapEntry[]> {
  const staticEntries: BlogSitemapEntry[] = staticBlogs.map((b) => ({
    slug: b.slug,
    locale: "en" as const,
  }));
  return withBlogDb(
    async () => {
      const docs = await BlogPostModel.find({ status: "published" })
        .select("slug locale")
        .lean();
      if (docs.length > 0) {
        return docs.map((d) => ({
          slug: d.slug,
          locale: parseBlogLocale(d.locale),
        }));
      }
      return staticEntries;
    },
    staticEntries,
  );
}

export async function listAdminBlogs(): Promise<AdminBlogPost[]> {
  await connectDb();
  const docs = await BlogPostModel.find().sort({ updatedAt: -1 }).lean();
  return docs.map((doc) => docToAdmin(doc as Parameters<typeof docToAdmin>[0]));
}

export async function getAdminBlogBySlug(
  slug: string,
  locale: BlogLocale,
): Promise<AdminBlogPost | null> {
  await connectDb();
  const doc = await BlogPostModel.findOne({ slug, locale }).lean();
  if (!doc) return null;
  return docToAdmin(doc as Parameters<typeof docToAdmin>[0]);
}

export function validateBlogPayload(body: unknown, opts?: { requireSlug?: boolean }) {
  if (!body || typeof body !== "object") throw new Error("Invalid payload.");
  const o = body as Record<string, unknown>;

  const title = typeof o.title === "string" ? o.title.trim() : "";
  const summary = typeof o.summary === "string" ? o.summary.trim() : "";
  const rawSlug = typeof o.slug === "string" ? o.slug.trim().toLowerCase() : "";
  const slug = rawSlug || slugifyBlogTitle(title);
  const locale = parseBlogLocale(o.locale);
  const translationRaw =
    typeof o.translationOf === "string" ? o.translationOf.trim().toLowerCase() : "";
  const translationOf = translationRaw || null;
  const category = typeof o.category === "string" ? o.category.trim() : "";
  const postBody = typeof o.body === "string" ? o.body : "";
  const status = o.status === "published" ? "published" : "draft";

  if (!title) throw new Error("Title is required.");
  if (!summary) throw new Error("Summary is required.");
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug must use lowercase letters, numbers, and hyphens only.");
  }
  if (translationOf && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(translationOf)) {
    throw new Error("Translation slug must use lowercase letters, numbers, and hyphens only.");
  }
  if (!BLOG_CATEGORIES.includes(category as BlogCategory)) {
    throw new Error("Invalid category.");
  }
  if (opts?.requireSlug && !rawSlug) throw new Error("Slug is required.");

  let publishedAt: Date | null = null;
  if (typeof o.publishedAt === "string" && o.publishedAt.trim()) {
    const d = new Date(o.publishedAt);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid publish date.");
    publishedAt = d;
  } else if (status === "published") {
    publishedAt = new Date();
  }

  const readingMinutesRaw = Number(o.readingMinutes);
  const readingMinutes =
    Number.isFinite(readingMinutesRaw) && readingMinutesRaw > 0
      ? Math.round(readingMinutesRaw)
      : estimateReadingMinutes(postBody);

  return {
    slug,
    locale,
    translationOf,
    title,
    summary,
    category: category as BlogCategory,
    body: postBody,
    status: status as BlogStatus,
    publishedAt,
    readingMinutes,
  };
}

async function assertSlugLocaleAvailable(slug: string, locale: BlogLocale, excludeId?: string) {
  const existing = await BlogPostModel.findOne({ slug, locale }).lean();
  if (existing && String(existing._id) !== excludeId) {
    throw new Error(
      locale === "es"
        ? "A Spanish post with this slug already exists."
        : "An English post with this slug already exists.",
    );
  }
}

export async function createBlogPost(
  input: ReturnType<typeof validateBlogPayload>,
  updatedByEmail?: string | null,
): Promise<AdminBlogPost> {
  await connectDb();
  await assertSlugLocaleAvailable(input.slug, input.locale);

  const doc = await BlogPostModel.create({
    ...input,
    updatedByEmail: updatedByEmail ?? undefined,
  });

  if (input.status === "published") revalidateBlogPaths(input.slug, input.locale);
  return docToAdmin(doc.toObject());
}

export async function updateBlogPost(
  slug: string,
  locale: BlogLocale,
  input: ReturnType<typeof validateBlogPayload>,
  updatedByEmail?: string | null,
): Promise<AdminBlogPost> {
  await connectDb();

  const existing = await BlogPostModel.findOne({ slug, locale }).lean();
  if (!existing) throw new Error("Post not found.");

  if (input.slug !== slug || input.locale !== locale) {
    await assertSlugLocaleAvailable(
      input.slug,
      input.locale,
      String(existing._id),
    );
  }

  if (input.locale !== locale) {
    throw new Error("Language cannot be changed after creation.");
  }

  const doc = await BlogPostModel.findOneAndUpdate(
    { slug, locale },
    {
      ...input,
      locale,
      updatedByEmail: updatedByEmail ?? undefined,
    },
    { new: true },
  ).lean();

  if (!doc) throw new Error("Post not found.");
  revalidateBlogPaths(slug, locale);
  if (input.slug !== slug || input.locale !== locale) {
    revalidateBlogPaths(input.slug, input.locale);
  }
  return docToAdmin(doc as Parameters<typeof docToAdmin>[0]);
}

export async function deleteBlogPost(slug: string, locale: BlogLocale): Promise<void> {
  await connectDb();
  const result = await BlogPostModel.deleteOne({ slug, locale });
  if (result.deletedCount === 0) throw new Error("Post not found.");
  revalidateBlogPaths(slug, locale);
}

export { BLOG_CATEGORIES, blogPublicPath };
