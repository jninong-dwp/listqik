import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { createR2Client, getR2Config } from "@/lib/r2";
import { Listing } from "@/models/Listing";

type Body = {
  fileName?: string;
  contentType?: string;
};

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "image";
}

function inferExt(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "bin";
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ ok: false, error: "Invalid listing id." }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const fileName = String(body.fileName ?? "").trim();
  const contentType = String(body.contentType ?? "").trim().toLowerCase();

  if (!fileName || !contentType.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, error: "fileName and image contentType are required." },
      { status: 400 },
    );
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const listing = await Listing.findOne({ _id: id, userId }).lean();
  if (!listing) {
    return NextResponse.json({ ok: false, error: "Listing not found." }, { status: 404 });
  }

  let cfg;
  try {
    cfg = getR2Config();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "R2 is not configured." },
      { status: 500 },
    );
  }

  const client = createR2Client();
  const ext = inferExt(contentType);
  const safeName = sanitizeFileName(fileName.replace(/\.[^.]+$/, ""));
  const key = `listings/${id}/hero/${Date.now()}-${safeName}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: cfg.bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = cfg.publicBaseUrl
    ? `${cfg.publicBaseUrl.replace(/\/$/, "")}/${key}`
    : `https://${cfg.bucketName}.${cfg.accountId}.r2.cloudflarestorage.com/${key}`;

  return NextResponse.json({
    ok: true,
    uploadUrl,
    key,
    publicUrl,
    expiresInSeconds: 300,
  });
}
