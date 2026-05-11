"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  const value = raw.trim();
  if (!value.startsWith("/")) return "/dashboard";
  // Prevent open redirects and protocol-relative values.
  if (value.startsWith("//")) return "/dashboard";
  return value;
}

export function SetupAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const nextPath = safeNextPath(searchParams.get("next"));

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = tokenFromUrl.trim();
    if (token.length < 16) {
      setError("Missing or invalid setup link. Open the link from your confirmation email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    const res = await fetch("/api/auth/setup-account", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    setBusy(false);

    if (!res) {
      setError("Network error.");
      return;
    }

    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; error?: string; email?: string }
      | null;
    if (!res.ok || !data?.ok) {
      setError(data?.error || "Could not complete setup.");
      return;
    }

    if (!data.email) {
      setError("Password saved, but automatic sign-in could not start. Please sign in manually.");
      router.push(`/login?callbackUrl=${encodeURIComponent(nextPath)}`);
      router.refresh();
      return;
    }

    const signInResult = await signIn("credentials", {
      email: data.email,
      password,
      redirect: false,
      callbackUrl: nextPath,
    });

    if (signInResult?.error) {
      setError("Password saved, but auto sign-in failed. Please sign in manually.");
      router.push(`/login?callbackUrl=${encodeURIComponent(nextPath)}`);
      router.refresh();
      return;
    }

    router.push(signInResult?.url ?? nextPath);
    router.refresh();
  }

  return (
    <div className="glass-surface-strong p-8">
      <h1 className="text-2xl font-semibold text-emerald-50">Finish your account</h1>
      <p className="mt-2 text-sm text-muted">
        Choose a password for your seller dashboard. Use the same email you used at checkout when you
        sign in.
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <label className="block text-sm font-medium text-emerald-100">
          Password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="mt-1 w-full rounded-xl border border-emerald-400/30 bg-black/30 px-3 py-2 text-emerald-50 outline-none ring-emerald-400/40 focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-emerald-100">
          Confirm password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(ev) => setPasswordConfirm(ev.target.value)}
            className="mt-1 w-full rounded-xl border border-emerald-400/30 bg-black/30 px-3 py-2 text-emerald-50 outline-none ring-emerald-400/40 focus:ring-2"
          />
        </label>
        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
          {busy ? "Saving…" : "Save password & continue to sign in"}
        </button>
      </form>
    </div>
  );
}
