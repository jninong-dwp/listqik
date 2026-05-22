import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { parseBlogLocale } from "@/lib/blog-locale";
import { slugifyBlogTitle } from "@/lib/blog-slug";
import { buildPublicImageUrl, createR2Client, getR2Config } from "@/lib/r2";
import {
  inferR2ImageExt,
  sanitizeR2FileName,
  validateR2ImageFile,
} from "@/lib/r2-image-upload";

export const runtime = "nodejs";

function sanitizeBlogSlug(raw: string | null): string {
  const slug = (raw ?? "").trim().toLowerCase();
  if (!slug) return "drafts";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return "drafts";
  return slug;
}

/**
 * POST /api/admin/blogs/upload-image
 *
 * multipart/form-data: `file` (required), `slug`, `locale` (optional, for R2 key path)
 */
export async function POST(req: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth && auth.error) return auth.error;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected multipart/form-data with a `file` field." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Missing `file` field in upload." },
      { status: 400 },
    );
  }

  const validation = validateR2ImageFile(file);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 415 });
  }

  const slugField = formData.get("slug");
  const slugFromForm = typeof slugField === "string" ? slugField : null;
  const titleField = formData.get("title");
  const localeField = formData.get("locale");
  const locale = parseBlogLocale(typeof localeField === "string" ? localeField : null);
  const slug =
    sanitizeBlogSlug(slugFromForm) === "drafts" && typeof titleField === "string" && titleField.trim()
      ? sanitizeBlogSlug(slugifyBlogTitle(titleField))
      : sanitizeBlogSlug(slugFromForm);

  let cfg;
  try {
    cfg = getR2Config();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "R2 is not configured." },
      { status: 500 },
    );
  }

  const ext = inferR2ImageExt(validation.contentType, file.name);
  const safeName = sanitizeR2FileName(file.name.replace(/\.[^.]+$/, ""));
  const key = `blogs/${locale}/${slug}/${Date.now()}-${safeName}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const client = createR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: cfg.bucketName,
        Key: key,
        Body: bytes,
        ContentType: validation.contentType,
        ContentLength: bytes.byteLength,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not upload to storage.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    key,
    publicUrl: buildPublicImageUrl(key),
  });
}
