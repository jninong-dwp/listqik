"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { slugifyBlogTitle } from "@/lib/blog-slug";
import type { BlogLocale } from "@/lib/blog-locale";

type BlogCategory = "playbooks" | "compliance" | "pricing" | "marketing";
type BlogStatus = "draft" | "published";

type BlogRecord = {
  slug: string;
  locale: BlogLocale;
  translationOf: string | null;
  title: string;
  summary: string;
  category: BlogCategory;
  body: string;
  status: BlogStatus;
  publishedAt: string;
  readingMinutes: number;
  updatedAt: string | null;
};

type Draft = {
  slug: string;
  locale: BlogLocale;
  translationOf: string;
  title: string;
  summary: string;
  category: BlogCategory;
  body: string;
  status: BlogStatus;
  publishedAt: string;
  readingMinutes: string;
};

type AdminFilter = "all" | BlogLocale;

const CATEGORIES: { value: BlogCategory; label: string }[] = [
  { value: "playbooks", label: "Playbooks" },
  { value: "compliance", label: "Compliance" },
  { value: "pricing", label: "Pricing" },
  { value: "marketing", label: "Marketing" },
];

const LOCALE_LABELS: Record<BlogLocale, string> = {
  en: "English (EN)",
  es: "Spanish (ES)",
};

function postKey(post: { slug: string; locale: BlogLocale }) {
  return `${post.locale}:${post.slug}`;
}

function parsePostKey(key: string): { locale: BlogLocale; slug: string } | null {
  const idx = key.indexOf(":");
  if (idx <= 0) return null;
  const locale = key.slice(0, idx);
  const slug = key.slice(idx + 1);
  if (locale !== "en" && locale !== "es" || !slug) return null;
  return { locale, slug };
}

const EMPTY_DRAFT: Draft = {
  slug: "",
  locale: "en",
  translationOf: "",
  title: "",
  summary: "",
  category: "playbooks",
  body: "",
  status: "draft",
  publishedAt: new Date().toISOString().slice(0, 10),
  readingMinutes: "",
};

function recordToDraft(post: BlogRecord): Draft {
  return {
    slug: post.slug,
    locale: post.locale,
    translationOf: post.translationOf ?? "",
    title: post.title,
    summary: post.summary,
    category: post.category,
    body: post.body,
    status: post.status,
    publishedAt: post.publishedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    readingMinutes: String(post.readingMinutes),
  };
}

export function AdminBlogBuilderForm() {
  const [posts, setPosts] = useState<BlogRecord[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<AdminFilter>("all");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [isNew, setIsNew] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = useMemo(() => {
    if (listFilter === "all") return posts;
    return posts.filter((p) => p.locale === listFilter);
  }, [posts, listFilter]);

  const selected = useMemo(() => {
    if (!selectedKey) return null;
    return posts.find((p) => postKey(p) === selectedKey) ?? null;
  }, [posts, selectedKey]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blogs", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; posts?: BlogRecord[]; error?: string }
        | null;
      if (!res.ok || !data?.ok || !data.posts) {
        setError(data?.error ?? "Could not load blog posts.");
        return;
      }
      setPosts(data.posts);
      if (!isNew) {
        setSelectedKey((prev) => {
          if (prev && data.posts?.some((p) => postKey(p) === prev)) return prev;
          return data.posts?.[0] ? postKey(data.posts[0]) : null;
        });
      }
    } catch {
      setError("Could not load blog posts.");
    } finally {
      setLoading(false);
    }
  }, [isNew]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (isNew) return;
    if (!selectedKey) {
      setDraft(EMPTY_DRAFT);
      return;
    }
    const post = posts.find((p) => postKey(p) === selectedKey);
    if (!post) return;
    setDraft(recordToDraft(post));
    setSuccess(null);
    setError(null);
  }, [selectedKey, posts, isNew]);

  const previewUrl = useMemo(() => {
    if (!draft.slug || draft.status !== "published") return null;
    return draft.locale === "es"
      ? `/resources/blogs/${draft.slug}?lang=es`
      : `/resources/blogs/${draft.slug}`;
  }, [draft.slug, draft.status, draft.locale]);

  function startNewPost(locale: BlogLocale = listFilter === "all" ? "en" : listFilter) {
    setIsNew(true);
    setSelectedKey(null);
    setDraft({ ...EMPTY_DRAFT, locale });
    setSlugTouched(false);
    setSuccess(null);
    setError(null);
  }

  function selectPost(key: string) {
    setIsNew(false);
    setSelectedKey(key);
    setSlugTouched(true);
  }

  function onTitleChange(title: string) {
    setDraft((prev) => ({
      ...prev,
      title,
      slug: !slugTouched && isNew ? slugifyBlogTitle(title) : prev.slug,
    }));
  }

  function insertIntoBody(snippet: string) {
    const el = bodyRef.current;
    if (!el) {
      setDraft((prev) => ({
        ...prev,
        body: prev.body ? `${prev.body.trimEnd()}\n\n${snippet}` : snippet,
      }));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const needsLeadingBreak = before.length > 0 && !before.endsWith("\n\n");
    const needsTrailingBreak = after.length > 0 && !after.startsWith("\n");
    const prefix = needsLeadingBreak ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const suffix = needsTrailingBreak ? "\n\n" : "";
    const next = `${before}${prefix}${snippet}${suffix}${after}`;
    setDraft((prev) => ({ ...prev, body: next }));
    const cursor = before.length + prefix.length + snippet.length + suffix.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  async function onImageSelected(file: File | null) {
    if (!file || uploadBusy || busy) return;
    setUploadBusy(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("locale", draft.locale);
    if (draft.slug.trim()) formData.append("slug", draft.slug.trim());
    if (draft.title.trim()) formData.append("title", draft.title.trim());

    try {
      const res = await fetch("/api/admin/blogs/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; publicUrl?: string; error?: string }
        | null;
      if (!res.ok || !data?.ok || !data.publicUrl) {
        setError(data?.error ?? "Image upload failed.");
        return;
      }
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Image";
      insertIntoBody(`![${alt}](${data.publicUrl})`);
      setSuccess("Image uploaded and inserted into the body.");
    } catch {
      setError("Network error while uploading image.");
    } finally {
      setUploadBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setSuccess(null);

    const payload = {
      slug: draft.slug.trim().toLowerCase(),
      locale: draft.locale,
      translationOf: draft.translationOf.trim() || null,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      category: draft.category,
      body: draft.body,
      status: draft.status,
      publishedAt: draft.publishedAt,
      readingMinutes: draft.readingMinutes ? Number(draft.readingMinutes) : undefined,
    };

    const editKey = !isNew && selectedKey ? parsePostKey(selectedKey) : null;

    try {
      const url = isNew
        ? "/api/admin/blogs"
        : `/api/admin/blogs/${encodeURIComponent(editKey?.slug ?? "")}?locale=${editKey?.locale ?? "en"}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; post?: BlogRecord; error?: string }
        | null;
      if (!res.ok || !data?.ok || !data.post) {
        setError(data?.error ?? "Save failed.");
        return;
      }

      const newKey = postKey(data.post);
      setPosts((prev) => {
        const withoutOld = prev.filter((p) => postKey(p) !== newKey && postKey(p) !== (selectedKey ?? ""));
        return [data.post!, ...withoutOld];
      });
      setIsNew(false);
      setSelectedKey(newKey);
      setDraft(recordToDraft(data.post));
      setSlugTouched(true);
      setSuccess(
        draft.status === "published"
          ? draft.locale === "es"
            ? "Spanish post published."
            : "Post published."
          : "Draft saved.",
      );
      await loadPosts();
    } catch {
      setError("Network error while saving.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (isNew || !selectedKey || busy) return;
    const parsed = parsePostKey(selectedKey);
    if (!parsed) return;
    if (!window.confirm(`Delete "${draft.title}" (${parsed.locale.toUpperCase()})? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `/api/admin/blogs/${encodeURIComponent(parsed.slug)}?locale=${parsed.locale}`,
        { method: "DELETE" },
      );
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Delete failed.");
        return;
      }
      setPosts((prev) => prev.filter((p) => postKey(p) !== selectedKey));
      setSelectedKey(null);
      setIsNew(false);
      setDraft(EMPTY_DRAFT);
      setSuccess("Post deleted.");
      await loadPosts();
    } catch {
      setError("Network error while deleting.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/15 bg-black/30 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-emerald-100">Blog builder</h3>
          <p className="text-sm text-white/65">
            Create English and Spanish articles separately. Tag each post as EN or ES for listing,
            SEO, and hreflang. Use{" "}
            <code className="rounded bg-black/40 px-1 font-mono text-xs">translation slug</code> when
            the Spanish URL differs from the English slug.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => startNewPost("en")}
            className="rounded-full border border-emerald-400/45 bg-emerald-600/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            New EN post
          </button>
          <button
            type="button"
            onClick={() => startNewPost("es")}
            className="rounded-full border border-amber-400/40 bg-amber-700/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            New ES post
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-white/55">Loading posts…</p>
      ) : error && posts.length === 0 && !isNew ? (
        <p className="rounded-lg border border-rose-500/35 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
          {error}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_1fr]">
          <nav className="space-y-2">
            <div className="flex gap-1 rounded-lg border border-white/10 bg-black/25 p-1">
              {(["all", "en", "es"] as AdminFilter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setListFilter(f)}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-semibold transition ${
                    listFilter === f
                      ? "bg-emerald-600/80 text-white"
                      : "text-white/55 hover:text-white/80"
                  }`}
                >
                  {f === "all" ? "All" : f.toUpperCase()}
                </button>
              ))}
            </div>
            {filteredPosts.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/55">
                No posts in this filter. Create a new EN or ES post.
              </p>
            ) : (
              filteredPosts.map((p) => {
                const key = postKey(p);
                const active = !isNew && key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectPost(key)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "border-emerald-400/45 bg-emerald-950/30 text-emerald-50"
                        : "border-white/10 bg-black/20 text-white/80 hover:border-white/20"
                    }`}
                  >
                    <span className="block font-medium line-clamp-2">{p.title}</span>
                    <span className="mt-0.5 block text-xs text-white/45">
                      {p.locale.toUpperCase()} · {p.status === "published" ? "Published" : "Draft"} ·{" "}
                      {p.slug}
                    </span>
                  </button>
                );
              })
            )}
          </nav>

          {(isNew || selected || posts.length === 0) && (
            <form onSubmit={onSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm sm:col-span-2">
                  <span className="text-white/70">Title</span>
                  <input
                    type="text"
                    required
                    value={draft.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                  />
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/70">Language</span>
                  <select
                    value={draft.locale}
                    disabled={!isNew}
                    onChange={(e) =>
                      setDraft({ ...draft, locale: e.target.value as BlogLocale })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white disabled:opacity-60"
                  >
                    <option value="en">{LOCALE_LABELS.en}</option>
                    <option value="es">{LOCALE_LABELS.es}</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/70">URL slug</span>
                  <input
                    type="text"
                    required
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setDraft({ ...draft, slug: e.target.value.toLowerCase() });
                    }}
                    disabled={!isNew && Boolean(selected)}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-white disabled:opacity-60"
                  />
                </label>

                <label className="block space-y-1.5 text-sm sm:col-span-2">
                  <span className="text-white/70">
                    English counterpart slug (optional, for hreflang)
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. trec-disclosures-zero-drama"
                    value={draft.translationOf}
                    onChange={(e) =>
                      setDraft({ ...draft, translationOf: e.target.value.toLowerCase() })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-white placeholder:text-white/30"
                  />
                  <span className="block text-xs text-white/45">
                    Leave empty if Spanish uses the same slug as English. Required when URLs differ.
                  </span>
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/70">Category</span>
                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft({ ...draft, category: e.target.value as BlogCategory })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/70">Status</span>
                  <select
                    value={draft.status}
                    onChange={(e) =>
                      setDraft({ ...draft, status: e.target.value as BlogStatus })
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/70">Publish date</span>
                  <input
                    type="date"
                    value={draft.publishedAt}
                    onChange={(e) => setDraft({ ...draft, publishedAt: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                  />
                </label>

                <label className="block space-y-1.5 text-sm">
                  <span className="text-white/70">Reading minutes (optional)</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Auto from word count"
                    value={draft.readingMinutes}
                    onChange={(e) => setDraft({ ...draft, readingMinutes: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                  />
                </label>
              </div>

              <label className="block space-y-1.5 text-sm">
                <span className="text-white/70">Summary (shown on index &amp; SEO)</span>
                <textarea
                  required
                  rows={3}
                  value={draft.summary}
                  onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                  className="w-full resize-y rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                />
              </label>

              <div className="space-y-1.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-white/70">Body</span>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
                      className="sr-only"
                      disabled={busy || uploadBusy}
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        void onImageSelected(f);
                      }}
                    />
                    <button
                      type="button"
                      disabled={busy || uploadBusy}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-emerald-400/40 hover:text-emerald-100 disabled:opacity-50"
                    >
                      {uploadBusy ? "Uploading…" : "Upload image"}
                    </button>
                  </div>
                </div>
                <textarea
                  ref={bodyRef}
                  required
                  rows={18}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  placeholder={
                    "## Section title\n\nOpening paragraph.\n\n![Photo description](https://…)\n\n- First point\n- Second point"
                  }
                  className="w-full resize-y rounded-lg border border-white/15 bg-black/40 px-3 py-2 font-mono text-xs leading-relaxed text-white placeholder:text-white/30"
                />
                <p className="text-xs text-white/45">
                  Images upload to R2 under blogs/{draft.locale || "en"}/. Save to publish.
                </p>
              </div>

              {previewUrl ? (
                <p className="text-xs text-white/55">
                  Public URL:{" "}
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-300 underline"
                  >
                    {previewUrl}
                  </a>
                </p>
              ) : null}

              {error ? (
                <p className="rounded-lg border border-rose-500/35 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="rounded-lg border border-emerald-500/35 bg-emerald-950/25 px-3 py-2 text-sm text-emerald-100">
                  {success}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busy || uploadBusy}
                  className="rounded-full border border-emerald-400/45 bg-emerald-600/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {busy ? "Saving…" : isNew ? "Create post" : "Save post"}
                </button>
                {!isNew && selectedKey ? (
                  <button
                    type="button"
                    disabled={busy || uploadBusy}
                    onClick={onDelete}
                    className="rounded-full border border-rose-500/35 bg-rose-950/30 px-5 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-950/50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
