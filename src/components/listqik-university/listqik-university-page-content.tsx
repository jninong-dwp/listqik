"use client";

import { useMemo } from "react";
import { Container } from "@/components/container";
import { useSiteLocale } from "@/components/site-locale-provider";
import { getListqikUniversityCopy } from "@/i18n/listqik-university-copy";
import type { YouTubeChannelFeed, YouTubeChannelVideo } from "@/lib/youtube-channel";

type ListqikUniversityPageContentProps = {
  feed: YouTubeChannelFeed;
};

const OTHER_LANGUAGE = "other";

const SPANISH_CHAR_RE = /[¿¡ñáéíóúü]/i;
// Keep this limited to Vietnamese-specific letters so Spanish accents do not
// get misclassified as Vietnamese.
const VIETNAMESE_CHAR_RE =
  /[ăâđêôơưạảãấầẩẫậắằẳẵặẹẻẽếềểễệịỉĩọỏõốồổỗộớờởỡợụủũứừửữựỵỷỹ]/i;
const PORTUGUESE_CHAR_RE = /[ãõç]/i;
const FRENCH_CHAR_RE = /[àâæçéèêëîïôœùûüÿ]/i;
const ARABIC_RE = /[\u0600-\u06FF]/;
const CYRILLIC_RE = /[\u0400-\u04FF]/;
const HANGUL_RE = /[\uAC00-\uD7AF]/;
const HIRAGANA_KATAKANA_RE = /[\u3040-\u30FF]/;
const CJK_RE = /[\u4E00-\u9FFF]/;

const LANGUAGE_HINTS: Array<{ code: string; words: string[] }> = [
  {
    code: "en",
    words: ["how", "what", "your", "home", "sell", "fast", "why", "the", "and", "listqik"],
  },
  {
    code: "es",
    words: ["como", "para", "tu", "casa", "vender", "rapido", "precio", "anuncio", "mas", "sabias"],
  },
  {
    code: "vi",
    words: ["tai", "sao", "ban", "nha", "nhung", "thay", "doi", "cho", "mot", "khi"],
  },
  {
    code: "pt",
    words: ["como", "casa", "vender", "rapido", "preco", "para", "mais", "voce", "seu", "imovel"],
  },
  {
    code: "fr",
    words: ["comment", "maison", "vendre", "prix", "pour", "votre", "plus", "avec", "est", "vous"],
  },
];

function formatPublished(iso: string, locale: "en" | "es") {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(locale === "es" ? "es-US" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z]+/)
    .filter((token) => token.length > 1);
}

function detectLanguageByScript(text: string): string | null {
  if (ARABIC_RE.test(text)) return "ar";
  if (CYRILLIC_RE.test(text)) return "ru";
  if (HANGUL_RE.test(text)) return "ko";
  if (HIRAGANA_KATAKANA_RE.test(text)) return "ja";
  if (CJK_RE.test(text)) return "zh";
  return null;
}

function detectLanguageByLatinHints(text: string): string | null {
  if (SPANISH_CHAR_RE.test(text)) return "es";
  if (VIETNAMESE_CHAR_RE.test(text)) return "vi";
  if (PORTUGUESE_CHAR_RE.test(text)) return "pt";
  if (FRENCH_CHAR_RE.test(text)) return "fr";

  const tokenSet = new Set(normalizeTokens(text));
  let bestCode: string | null = null;
  let bestScore = 0;

  for (const hint of LANGUAGE_HINTS) {
    const score = hint.words.reduce((sum, word) => sum + (tokenSet.has(word) ? 1 : 0), 0);
    if (score > bestScore) {
      bestCode = hint.code;
      bestScore = score;
    }
  }

  return bestScore >= 2 ? bestCode : null;
}

function detectVideoLanguage(video: YouTubeChannelVideo): string {
  const text = `${video.title}\n${video.description}`.trim();
  if (!text) return OTHER_LANGUAGE;
  return detectLanguageByScript(text) ?? detectLanguageByLatinHints(text) ?? OTHER_LANGUAGE;
}

function buttonCodeLabel(code: string) {
  if (code === OTHER_LANGUAGE) return "OTHER";
  return code.toUpperCase();
}

function languageDisplayLabel(
  code: string,
  locale: "en" | "es",
  fallbackOther: string,
) {
  if (code === OTHER_LANGUAGE) return fallbackOther;
  try {
    const displayNames = new Intl.DisplayNames([locale === "es" ? "es" : "en"], {
      type: "language",
    });
    return displayNames.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export function ListqikUniversityPageContent({ feed }: ListqikUniversityPageContentProps) {
  const { locale, ready } = useSiteLocale();
  const copy = getListqikUniversityCopy(locale);
  const selectedVideoLanguage = locale;

  const languageByVideoId = useMemo(() => {
    return new Map(feed.videos.map((video) => [video.id, detectVideoLanguage(video)]));
  }, [feed.videos]);

  const filteredVideos = useMemo(() => {
    return feed.videos.filter(
      (video) => (languageByVideoId.get(video.id) ?? OTHER_LANGUAGE) === selectedVideoLanguage,
    );
  }, [feed.videos, languageByVideoId, selectedVideoLanguage]);

  return (
    <div
      className={[
        "py-10 transition-opacity duration-200 sm:py-14",
        ready ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <Container>
        <div className="mx-auto max-w-4xl space-y-10">
          <header className="space-y-4">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              {copy.eyebrow}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {copy.title}
            </h1>
            <p className="text-base text-muted">{copy.intro}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={feed.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 text-sm font-semibold tracking-wide text-emerald-100 transition hover:bg-emerald-400/30"
              >
                {copy.subscribe}
              </a>
              <a
                href={feed.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                {copy.channelCta} ↗
              </a>
            </div>
            <p className="text-xs font-mono text-white/45">
              {feed.channelTitle} · {copy.updatedNote}
            </p>
          </header>

          <div className="glass-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">{copy.whatYouLearnTitle}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {copy.topics.map((topic) => (
                <li
                  key={topic.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="font-semibold text-white">{topic.title}</div>
                  <div className="mt-1 text-sm text-muted">{topic.body}</div>
                </li>
              ))}
            </ul>
          </div>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">{copy.latestTitle}</h2>
              <p className="mt-1 text-sm text-muted">{copy.latestHint}</p>
            </div>

            {filteredVideos.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredVideos.map((video, index) => {
                  const videoLanguage = languageByVideoId.get(video.id) ?? OTHER_LANGUAGE;
                  const videoLanguageLabel = languageDisplayLabel(
                    videoLanguage,
                    locale,
                    copy.otherLanguagesLabel,
                  );

                  return (
                  <article key={video.id} className="glass-surface overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {index === 0 ? <span className="chip">{copy.featuredLabel}</span> : null}
                        <span className="chip" title={videoLanguageLabel}>
                          {buttonCodeLabel(videoLanguage)}
                        </span>
                      </div>
                      <h3
                        className={[
                          "font-semibold text-white",
                          index === 0 ? "mt-3 text-lg" : "mt-3 text-base",
                        ].join(" ")}
                      >
                        {video.title}
                      </h3>
                      {video.publishedAt ? (
                        <p className="mt-1 text-xs font-mono text-white/50">
                          {formatPublished(video.publishedAt, locale)}
                        </p>
                      ) : null}
                      {video.description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted">{video.description}</p>
                      ) : null}
                      <a
                        href={video.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs font-semibold text-emerald-200/90 hover:text-emerald-100"
                      >
                        {copy.watchOnYoutube} ↗
                      </a>
                    </div>
                    <div className="aspect-video w-full bg-black/30">
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </article>
                  );
                })}
              </div>
            ) : feed.videos.length > 0 ? (
              <div className="glass-surface p-8 text-center">
                <div className="text-lg font-semibold text-white">{copy.noLanguageMatchTitle}</div>
                <p className="mt-2 text-sm text-muted">{copy.noLanguageMatchBody}</p>
                <a
                  href={feed.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-[40px] items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 text-sm font-semibold tracking-wide text-emerald-100 transition hover:bg-emerald-400/30"
                >
                  {copy.subscribe}
                </a>
              </div>
            ) : (
              <div className="glass-surface p-8 text-center">
                <div className="text-lg font-semibold text-white">{copy.emptyTitle}</div>
                <p className="mt-2 text-sm text-muted">{copy.emptyBody}</p>
                <a
                  href={feed.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-[40px] items-center rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 text-sm font-semibold tracking-wide text-emerald-100 transition hover:bg-emerald-400/30"
                >
                  {copy.subscribe}
                </a>
              </div>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
