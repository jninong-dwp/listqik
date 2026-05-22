import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-api-auth";
import {
  createBlogPost,
  listAdminBlogs,
  validateBlogPayload,
} from "@/lib/blog-service";

export async function GET() {
  const auth = await requireAdminSession();
  if ("error" in auth && auth.error) return auth.error;

  const posts = await listAdminBlogs();
  return NextResponse.json({ ok: true, posts });
}

export async function POST(req: Request) {
  const auth = await requireAdminSession();
  if ("error" in auth && auth.error) return auth.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const payload = validateBlogPayload(body);
    const post = await createBlogPost(payload, auth.session?.user?.email ?? null);
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create post.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
