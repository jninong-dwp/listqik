"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full rounded-lg border border-emerald-500/35 bg-emerald-950/30 px-3 py-2 text-left text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/60 hover:bg-emerald-900/40"
    >
      Logout
    </button>
  );
}
