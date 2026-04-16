"use client";

import { useMemo, useState } from "react";

type CalcInputs = {
  salePrice: number;
  mortgagePayoff: number;
  closingCostsPct: number; // percent of sale price
  traditionalAgentPct: number;
  listQikPct: number;
};

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function NetProceedsCalculator() {
  // Phase 1: visually satisfying slider-driven widget.
  // Numbers can be swapped later with "Vicky's" exact model without refactor.
  const [salePrice, setSalePrice] = useState(650_000);

  const inputs: CalcInputs = useMemo(
    () => ({
      salePrice,
      mortgagePayoff: Math.round(salePrice * 0.42),
      closingCostsPct: 1.25,
      traditionalAgentPct: 3.0,
      listQikPct: 1.0,
    }),
    [salePrice],
  );

  const result = useMemo(() => {
    const closingCosts = (inputs.salePrice * inputs.closingCostsPct) / 100;
    const traditionalFee = (inputs.salePrice * inputs.traditionalAgentPct) / 100;
    const listQikFee = (inputs.salePrice * inputs.listQikPct) / 100;

    const proceedsTraditional =
      inputs.salePrice - inputs.mortgagePayoff - closingCosts - traditionalFee;
    const proceedsListQik =
      inputs.salePrice - inputs.mortgagePayoff - closingCosts - listQikFee;

    const equityRetained = Math.max(0, proceedsListQik - proceedsTraditional);

    const retainedRatio =
      traditionalFee <= 0 ? 1 : Math.min(1, Math.max(0, equityRetained / traditionalFee));

    return {
      closingCosts,
      traditionalFee,
      listQikFee,
      proceedsTraditional,
      proceedsListQik,
      equityRetained,
      retainedRatio,
    };
  }, [inputs]);

  return (
    <div className="glass-surface-strong border border-lime-400/25 bg-emerald-950/25 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-widest text-emerald-200/75">
              NET PROCEEDS CALCULATOR
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-emerald-100 sm:text-2xl">
              Simulate your equity retention.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Slide the sale price. Watch retained equity grow. Swap in your exact
              cost model later without touching UI.
            </p>
          </div>
            <div className="shrink-0 rounded-2xl border border-emerald-400/20 bg-black/30 px-4 py-3 text-left sm:border-0 sm:bg-transparent sm:p-0 sm:text-right">
            <div className="text-xs font-mono text-emerald-100/60">Sale price</div>
            <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-emerald-100 sm:text-xl">
              {formatMoney(inputs.salePrice)}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="flex items-center justify-between text-xs font-semibold tracking-widest text-emerald-200/75">
            <span>SALE PRICE</span>
            <span className="font-mono text-emerald-100/90">{formatMoney(salePrice)}</span>
          </label>
          <input
            aria-label="Sale price slider"
            type="range"
            min={250_000}
            max={2_500_000}
            step={25_000}
            value={salePrice}
            onChange={(e) => setSalePrice(Number(e.target.value))}
            className="w-full accent-[color:var(--lp-accent)]"
          />

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-900/20 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-widest text-emerald-200/70">
                  EQUITY RETAINED
                </div>
                <div className="mt-1 text-xl font-semibold tracking-tight text-emerald-100 tabular-nums sm:text-2xl lg:text-3xl">
                  <span className="text-glow">{formatMoney(result.equityRetained)}</span>
                </div>
              </div>
              <div className="text-left sm:max-w-[11rem] sm:text-right">
                <div className="text-xs font-mono text-emerald-100/55">Model</div>
                <div className="mt-1 text-xs font-semibold leading-snug text-emerald-100/85 sm:text-sm">
                  ListQik.com 1.0% vs Trad 3.0%
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-black/45">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(result.retainedRatio * 100)}%`,
                    background:
                      "linear-gradient(90deg, rgba(74,222,128,1), rgba(16,185,129,1))",
                  }}
                />
              </div>
              <div className="mt-2 flex flex-col gap-1 text-xs text-emerald-100/65 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">Traditional fee leakage</span>
                <span className="shrink-0 font-mono tabular-nums">
                  {Math.round(result.retainedRatio * 100)}% recaptured
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-surface min-w-0 border border-emerald-500/15 bg-black/35 p-3 sm:p-4">
              <div className="text-xs font-semibold tracking-widest text-emerald-200/70">
                TRADITIONAL PATH
              </div>
              <div className="mt-3 grid gap-1 text-sm">
                <Row label="Agent fee" value={formatMoney(result.traditionalFee)} />
                <Row label="Closing costs" value={formatMoney(result.closingCosts)} />
                <Row label="Mortgage payoff" value={formatMoney(inputs.mortgagePayoff)} />
                <Row
                  label="Net proceeds"
                  value={formatMoney(result.proceedsTraditional)}
                  strong
                />
              </div>
            </div>
            <div className="glass-surface min-w-0 border border-emerald-500/15 bg-black/35 p-3 sm:p-4">
              <div className="text-xs font-semibold tracking-widest text-emerald-200/70">
                LISTQIK.COM PATH
              </div>
              <div className="mt-3 grid gap-1 text-sm">
                <Row label="Platform fee" value={formatMoney(result.listQikFee)} />
                <Row label="Closing costs" value={formatMoney(result.closingCosts)} />
                <Row label="Mortgage payoff" value={formatMoney(inputs.mortgagePayoff)} />
                <Row
                  label="Net proceeds"
                  value={formatMoney(result.proceedsListQik)}
                  strong
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-emerald-100/55">
            Prototype calculator for UI/interaction. Replace percentages and payoff
            assumptions later with your validated model.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className={["min-w-0 truncate", strong ? "text-emerald-100" : "text-emerald-100/70"].join(" ")}>
        {label}
      </span>
      <span
        className={[
          "shrink-0 whitespace-nowrap text-right font-mono tabular-nums",
          strong ? "text-emerald-100" : "text-emerald-100/85",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

