"use client";

import { FormEvent, useEffect, useState } from "react";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
};

export default function DashboardProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "", phone: "" });
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let canceled = false;
    fetch("/api/dashboard/profile", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; profile?: ProfileData; error?: string }
          | null;
        if (!res.ok || !data?.ok || !data.profile) throw new Error(data?.error || "Could not load profile.");
        if (!canceled) {
          setProfile(data.profile);
          setFormName(data.profile.name ?? "");
          setFormPhone(data.profile.phone ?? "");
        }
      })
      .catch((err: unknown) => {
        if (!canceled) setError(err instanceof Error ? err.message : "Could not load profile.");
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, []);

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const body = {
      name: formName,
      phone: formPhone,
      currentPassword,
      newPassword,
    };
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: body.name,
          phone: body.phone,
          ...(body.newPassword ? { currentPassword: body.currentPassword, newPassword: body.newPassword } : {}),
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Could not update profile.");
      setMessage("Profile saved.");
      setProfile((prev) => ({ ...prev, name: body.name, phone: body.phone }));
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-500/25 bg-black/45 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-emerald-50">Profile & Password</h2>
      <p className="mt-1 text-sm text-white/70">Update your account profile and change your password.</p>
      {loading ? <p className="mt-4 text-sm text-white/70">Loading profile...</p> : null}
      {!loading ? (
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(e) => void saveProfile(e)}>
          <label className="text-sm text-emerald-100">
            Name
            <input
              className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50"
              name="name"
              value={formName}
              onChange={(ev) => setFormName(ev.target.value)}
              required
            />
          </label>
          <label className="text-sm text-emerald-100">
            Email (read-only)
            <input
              className="mt-1 w-full rounded-lg border border-emerald-500/20 bg-black/20 px-3 py-2 text-sm text-emerald-200/70"
              value={profile.email}
              readOnly
            />
          </label>
          <label className="text-sm text-emerald-100 sm:col-span-2">
            Phone
            <input
              className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50"
              name="phone"
              value={formPhone}
              onChange={(ev) => setFormPhone(ev.target.value)}
            />
          </label>
          <label className="text-sm text-emerald-100">
            Current password
            <input
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(ev) => setCurrentPassword(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50"
            />
          </label>
          <label className="text-sm text-emerald-100">
            New password
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(ev) => setNewPassword(ev.target.value)}
              className="mt-1 w-full rounded-lg border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-50"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full border border-emerald-400/70 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
          {message ? <p className="sm:col-span-2 text-sm text-emerald-200">{message}</p> : null}
          {error ? <p className="sm:col-span-2 text-sm text-rose-200">{error}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
