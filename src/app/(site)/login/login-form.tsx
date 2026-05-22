"use client";

import { getSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

/** Next.js router.push needs a pathname; signIn may return a full URL. */
function pathnameFromCallbackUrl(raw: string): string {
  const fallback = "/dashboard";
  if (!raw) return fallback;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      return new URL(raw).pathname || fallback;
    } catch {
      return fallback;
    }
  }
  const path = raw.split("?")[0] || fallback;
  return path.startsWith("/") ? path : fallback;
}

function resolvePostLoginPath(
  callbackUrl: string,
  session: { user?: { isAdmin?: boolean } } | null,
): string {
  const path = pathnameFromCallbackUrl(callbackUrl);
  if (session?.user?.isAdmin) {
    return path.startsWith("/dashboard/admin") ? path : "/dashboard/admin";
  }
  return path;
}

export function LoginForm() {
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
        Use the email and password for your seller account. After checkout, new sellers finish setup
        from the link emailed from our order automation (or open the setup URL returned by the payment
        webhook) before signing in here.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const res = await signIn("credentials", {
            email: email.trim().toLowerCase(),
            password,
            redirect: false,
            callbackUrl,
          });
          setBusy(false);
          if (!res?.ok) {
            setError(res?.error === "CredentialsSignin" ? "Invalid email or password." : "Sign-in failed. Try again.");
            return;
          }
          const session = await getSession();
          const destination = resolvePostLoginPath(callbackUrl, session);
          // Full page load so the session cookie is visible to middleware (router.push with
          // res.url's absolute URL often does nothing in the App Router).
          window.location.assign(destination);
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
