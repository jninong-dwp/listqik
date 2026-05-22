export const R2_IMAGE_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

export const R2_IMAGE_MAX_BYTES = 15 * 1024 * 1024;

export function sanitizeR2FileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "image";
}

export function inferR2ImageExt(contentType: string, fileName: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  if (contentType === "image/heic" || contentType === "image/heif") return "heic";
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpg";
  if (lower.endsWith(".png")) return "png";
  if (lower.endsWith(".webp")) return "webp";
  if (lower.endsWith(".gif")) return "gif";
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "heic";
  return "bin";
}

export function resolveR2ImageContentType(file: File): string {
  const fromType = (file.type || "").toLowerCase();
  if (fromType) return fromType;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".heic")) return "image/heic";
  if (lower.endsWith(".heif")) return "image/heif";
  return "";
}

export function validateR2ImageFile(file: File): { ok: true; contentType: string } | { ok: false; error: string } {
  const contentType = resolveR2ImageContentType(file);
  if (!R2_IMAGE_ALLOWED_TYPES.has(contentType)) {
    return {
      ok: false,
      error: "Unsupported image type. Use JPEG, PNG, WEBP, GIF, or HEIC.",
    };
  }
  if (file.size <= 0) {
    return { ok: false, error: "Empty file." };
  }
  if (file.size > R2_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `Image exceeds the ${Math.round(R2_IMAGE_MAX_BYTES / (1024 * 1024))}MB limit.`,
    };
  }
  return { ok: true, contentType };
}
