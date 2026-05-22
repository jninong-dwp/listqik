import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { parseBlogLocale } from "@/lib/blog-locale";
import {
  deleteBlogPost,
  getAdminBlogBySlug,
  updateBlogPost,
  validateBlogPayload,
} from "@/lib/blog-service";

function localeFromRequest(req: Request): ReturnType<typeof parseBlogLocale> {
  const url = new URL(req.url);
  return parseBlogLocale(url.searchParams.get("locale"));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await requireAdminSession();
  if ("error" in auth && auth.error) return auth.error;

  const { slug } = await params;
  const locale = localeFromRequest(req);
  const post = await getAdminBlogBySlug(slug, locale);
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, post });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await requireAdminSession();
  if ("error" in auth && auth.error) return auth.error;

  const { slug } = await params;
  const locale = localeFromRequest(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const payload = validateBlogPayload(body);
    const post = await updateBlogPost(slug, locale, payload, auth.session?.user?.email ?? null);
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save post.";
    const status = message === "Post not found." ? 404 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const auth = await requireAdminSession();
  if ("error" in auth && auth.error) return auth.error;

  const { slug } = await params;
  const locale = localeFromRequest(req);
  try {
    await deleteBlogPost(slug, locale);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not delete post.";
    const status = message === "Post not found." ? 404 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
