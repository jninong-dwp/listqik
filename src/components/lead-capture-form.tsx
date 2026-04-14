"use client";

import { useMemo, useState } from "react";

type LeadCaptureListingContext = {
  slug?: string;
  title?: string;
  city?: string;
  state?: string;
  price?: number;
  url?: string;
};

export function LeadCaptureForm({
  listing,
  source = "listings",
}: {
  listing?: LeadCaptureListingContext;
  source?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState<string>("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(true);

  const canSubmit = useMemo(() => {
    if (status === "sending") return false;
    if (name.trim().length < 2) return false;
    if (!email.includes("@")) return false;
    if (!consent) return false;
    return true;
  }, [consent, email, name, status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("sending");
    setError("");

    const utm = (() => {
      if (typeof window === "undefined") return {};
      const params = new URLSearchParams(window.location.search);
      const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
      return Object.fromEntries(keys.map((k) => [k, params.get(k) ?? undefined]));
    })();

    const res = await fetch("/api/ghl/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
        consent,
        source,
        listing,
        utm,
        // honeypot:
        company: "",
      }),
    }).catch((err: unknown) => {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Network error");
      return null;
    });

    if (!res) return;
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setStatus("error");
      setError(data?.error || "Submission failed");
      return;
    }

    setStatus("success");
  }

  return (
    <div className="glass-surface p-6">
      <div className="text-xs font-semibold tracking-widest text-white/60">
        GET UPDATES
      </div>
      <h2 className="mt-2 text-lg font-semibold text-white">Request info</h2>
      <p className="mt-2 text-sm text-muted">
        We’ll follow up quickly with availability, disclosures, and next steps.
      </p>

      {status === "success" ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Submitted.</div>
          <div className="mt-1 text-sm text-muted">
            Thanks — we’ll reach out shortly.
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
                placeholder="Full name"
                required
              />
            </Field>
            <Field label="Email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
                placeholder="you@domain.com"
                required
              />
            </Field>
          </div>

          <Field label="Phone (optional)">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              autoComplete="tel"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
              placeholder="(555) 555-5555"
            />
          </Field>

          <Field label="Message (optional)">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
              placeholder="Questions, timeline, financing status…"
            />
          </Field>

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 accent-[color:var(--lp-accent)]"
            />
            <span>
              I agree to be contacted about this listing, broker-facilitated real estate services,
              and related marketing support.
            </span>
          </label>

          {status === "error" ? (
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-[color:var(--lp-danger)]">
              {error || "Something went wrong."}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "sending" ? "Sending…" : "Send request"}
          </button>

          <p className="text-xs text-white/50">
            This form routes to your CRM via a secure server endpoint.
          </p>
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold tracking-widest text-white/60">
        {label.toUpperCase()}
      </span>
      {children}
    </label>
  );
}

