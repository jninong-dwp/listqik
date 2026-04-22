"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-md glass-surface-strong p-8">
      <h1 className="text-2xl font-semibold text-emerald-50">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Use the email and password for your seller account. New accounts are created through the
        pricing intake flow after plan selection.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
          });
          setBusy(false);
          if (res?.error) {
            setError("Invalid email or password.");
            return;
          }
          router.push(res?.url ?? callbackUrl);
          router.refresh();
        }}
      >
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <label className="block text-sm font-medium text-emerald-100">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="mt-1 w-full rounded-xl border border-emerald-400/30 bg-black/30 px-3 py-2 text-emerald-50 outline-none ring-emerald-400/40 focus:ring-2"
          />
        </label>
        <label className="block text-sm font-medium text-emerald-100">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="mt-1 w-full rounded-xl border border-emerald-400/30 bg-black/30 px-3 py-2 text-emerald-50 outline-none ring-emerald-400/40 focus:ring-2"
          />
        </label>
        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
