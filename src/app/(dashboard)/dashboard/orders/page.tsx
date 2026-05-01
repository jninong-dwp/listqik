"use client";

import { useEffect, useState } from "react";

type OrderRow = {
  id: string;
  type: "LISTING_ORDER" | "PLAN_PURCHASE";
  title: string;
  status: string;
  planLabel: string;
  total: number | null;
  purchasedAt: string | null;
  listedOn: string | null;
  expiresOn: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function formatMoney(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function DashboardOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    let canceled = false;
    fetch("/api/dashboard/orders", { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as { ok?: boolean; orders?: OrderRow[]; error?: string } | null;
        if (!res.ok || !data?.ok || !Array.isArray(data.orders)) {
          throw new Error(data?.error || "Could not load orders.");
        }
        if (!canceled) setOrders(data.orders);
      })
      .catch((err: unknown) => {
        if (!canceled) setError(err instanceof Error ? err.message : "Could not load orders.");
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-emerald-500/25 bg-black/45 p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-emerald-50">Order History</h2>
      <p className="mt-1 text-sm text-white/70">Your listing orders and plan purchases.</p>
      {loading ? <p className="mt-4 text-sm text-white/70">Loading orders...</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
      {!loading && !error ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-emerald-500/25 text-emerald-200/80">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Plan</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Purchased</th>
                <th className="py-2 pr-4">Listed</th>
                <th className="py-2">Expires</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => (
                <tr key={`${row.type}:${row.id}`} className="border-b border-white/10 text-emerald-50/95">
                  <td className="py-2 pr-4">{row.title}</td>
                  <td className="py-2 pr-4">{row.type === "LISTING_ORDER" ? "Listing" : "Plan"}</td>
                  <td className="py-2 pr-4">{row.status}</td>
                  <td className="py-2 pr-4">{row.planLabel || "—"}</td>
                  <td className="py-2 pr-4">{formatMoney(row.total)}</td>
                  <td className="py-2 pr-4">{formatDate(row.purchasedAt)}</td>
                  <td className="py-2 pr-4">{formatDate(row.listedOn)}</td>
                  <td className="py-2">{formatDate(row.expiresOn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 ? <p className="mt-3 text-sm text-white/70">No orders yet.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
