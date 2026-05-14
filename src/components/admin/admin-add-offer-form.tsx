"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  listingId: string;
};

export function AdminAddOfferForm({ listingId }: Props) {
  const router = useRouter();
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setSuccess(null);

    const amountNum = Number(amount);
    if (!buyerName.trim() || !Number.isFinite(amountNum) || amountNum <= 0) {
      setError("Buyer name and a valid offer amount are required.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/offers`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
          amount: amountNum,
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Could not save the offer.");
        return;
      }
      setSuccess(`Saved offer from ${buyerName.trim()}.`);
      setBuyerName("");
      setBuyerEmail("");
      setBuyerPhone("");
      setAmount("");
      setMessage("");
      router.refresh();
    } catch {
      setError("Network error while saving the offer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          type="text"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Buyer name"
          className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/40"
        />
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Offer amount (USD)"
          className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/40"
        />
        <input
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="Buyer email (optional)"
          className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/40"
        />
        <input
          type="tel"
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          placeholder="Buyer phone (optional)"
          className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/40"
        />
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="Offer notes (optional)"
        className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white/90 placeholder:text-white/40"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full border border-emerald-300/70 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving…" : "Add buyer offer"}
        </button>
        {error ? <span className="text-xs text-rose-300">{error}</span> : null}
        {success ? <span className="text-xs text-emerald-300">{success}</span> : null}
      </div>
    </form>
  );
}
