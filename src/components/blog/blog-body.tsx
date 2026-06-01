import Link from "next/link";
import type { ReactNode } from "react";

const IMAGE_LINE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const INLINE_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderInlineMarkdown(text: string, keyPrefix: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;
  for (const match of text.matchAll(INLINE_LINK_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    const label = match[1] ?? "";
    const href = match[2]?.trim() ?? "";
    if (href.startsWith("/")) {
      parts.push(
        <Link
          key={`${keyPrefix}-link-${matchIndex}`}
          href={href}
          className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
        >
          {label}
        </Link>,
      );
    } else if (href) {
      parts.push(
        <a
          key={`${keyPrefix}-link-${matchIndex}`}
          href={href}
          className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          target={href.startsWith("http") ? "_blank" : undefined}
        >
          {label}
        </a>,
      );
    } else {
      parts.push(match[0]);
    }
    lastIndex = index + match[0].length;
    matchIndex += 1;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

/** Renders admin-authored blog body (lightweight markdown-style). */
export function BlogBody({ body }: { body: string }) {
  const trimmed = body.trim();
  if (!trimmed) {
    return (
      <p className="text-sm text-white/70">
        This article has no body content yet. Check back soon.
      </p>
    );
  }

  const blocks = trimmed.split(/\n\n+/);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-white/85">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trimEnd());
        const first = lines[0] ?? "";

        if (first.startsWith("## ")) {
          return (
            <h2 key={i} className="text-base font-semibold text-white">
              {first.slice(3).trim()}
            </h2>
          );
        }

        const imageMatch = lines.length === 1 ? IMAGE_LINE_RE.exec(first) : null;
        if (imageMatch) {
          const alt = imageMatch[1]?.trim() || "Blog image";
          const src = imageMatch[2]?.trim() ?? "";
          if (!src) return null;
          return (
            <figure key={i} className="overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                className="h-auto w-full max-w-full object-contain"
                loading="lazy"
              />
              {alt && alt !== "Image" && alt !== "Blog image" ? (
                <figcaption className="border-t border-white/10 px-3 py-2 text-xs text-white/55">
                  {alt}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul
              key={i}
              className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70"
            >
              {lines.map((line, j) => (
                <li key={j}>{renderInlineMarkdown(line.slice(2).trim(), `li-${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i}>
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                {renderInlineMarkdown(line, `p-${i}-${j}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
