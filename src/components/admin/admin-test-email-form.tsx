"use client";

import { useEffect, useState } from "react";

type SmtpStatus = {
  configured: boolean;
  from: string | null;
  host: string | null;
};

export function AdminTestEmailForm() {
  const [smtp, setSmtp] = useState<SmtpStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("ListQik test email");
  const [body, setBody] = useState(
    "This is a test message from the ListQik admin console.\n\nIf you received this, SMTP is working.",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/test-email", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; smtp?: SmtpStatus; error?: string }
          | null;
        if (cancelled) return;
        if (!res.ok || !data?.ok) {
          setError(data?.error ?? "Could not load SMTP status.");
          return;
        }
        setSmtp(data.smtp ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load SMTP status.");
      })
      .finally(() => {
        if (!cancelled) setLoadingStatus(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Send failed.");
        return;
      }
      setSuccess(data.message ?? `Test email sent to ${to.trim()}.`);
    } catch {
      setError("Network error while sending.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/15 bg-black/30 p-4 sm:p-6">
      <header className="space-y-1">
        <h3 className="text-base font-semibold text-emerald-100">Send test email</h3>
        <p className="text-sm text-white/65">
          Verify SMTP settings before relying on transactional emails (listing finalize, upgrades, etc.).
        </p>
      </header>

      {loadingStatus ? (
        <p className="text-sm text-white/55">Checking SMTP configuration…</p>
      ) : smtp?.configured ? (
        <p className="rounded-lg border border-emerald-500/25 bg-emerald-950/25 px-3 py-2 text-xs text-emerald-100/90">
          SMTP ready · From <span className="font-mono">{smtp.from}</span>
          {smtp.host ? (
            <>
              {" "}
              · Host <span className="font-mono">{smtp.host}</span>
            </>
          ) : null}
        </p>
      ) : (
        <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">
          SMTP is not fully configured. Set <code className="font-mono">SMTP_HOST</code>,{" "}
          <code className="font-mono">SMTP_PORT</code>, <code className="font-mono">SMTP_FROM</code>,{" "}
          <code className="font-mono">SMTP_USER</code>, and <code className="font-mono">SMTP_PASS</code> in your
          environment.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1.5 text-sm">
          <span className="text-white/70">To</span>
          <input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/35"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="text-white/70">Subject (optional)</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/35"
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="text-white/70">Body</span>
          <textarea
            required
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full resize-y rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/35"
          />
        </label>

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

        <button
          type="submit"
          disabled={busy || !smtp?.configured}
          className="rounded-full border border-emerald-400/45 bg-emerald-600/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send test email"}
        </button>
      </form>
    </div>
  );
}
