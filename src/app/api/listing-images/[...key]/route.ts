import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { createR2Client, getR2Config } from "@/lib/r2";

export const runtime = "nodejs";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour
const BROWSER_CACHE_SECONDS = 30 * 60; // 30 minutes — half of the signed URL TTL

/**
 * GET /api/listing-images/<key segments...>
 *
 * Resolves to a short-lived signed GET URL on R2 via a 302 redirect. The
 * browser caches the redirect for `BROWSER_CACHE_SECONDS`, and `<img>` tags
 * transparently follow it. This sidesteps any direct R2 CORS/public-bucket
 * setup — only the AWS SDK needs to be able to sign URLs server-side.
 *
 * Keys are constrained to the `listings/` prefix so the route can't be abused
 * as a general R2 reader.
 */
export async function GET(req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: keySegments } = await ctx.params;
  if (!Array.isArray(keySegments) || keySegments.length === 0) {
    return NextResponse.json({ ok: false, error: "Missing object key." }, { status: 400 });
  }

  const key = keySegments
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");

  if (!key.startsWith("listings/") || key.includes("..")) {
    return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
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

  try {
    const client = createR2Client();
    const signedUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: cfg.bucketName, Key: key }),
      { expiresIn: SIGNED_URL_TTL_SECONDS },
    );

    return NextResponse.redirect(new URL(signedUrl), {
      status: 302,
      headers: {
        "cache-control": `private, max-age=${BROWSER_CACHE_SECONDS}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load image.";
    // Helps when debugging without exposing the bucket key in user-facing UI.
    console.error("[listing-images] sign failed for", key, message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
