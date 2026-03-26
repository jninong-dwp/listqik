"use client";

import { useMemo, useState } from "react";

type CalcInputs = {
  salePrice: number;
  mortgagePayoff: number;
  closingCostsPct: number; // percent of sale price
  traditionalAgentPct: number;
  listPathPct: number;
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
      listPathPct: 1.0,
    }),
    [salePrice],
  );

  const result = useMemo(() => {
    const closingCosts = (inputs.salePrice * inputs.closingCostsPct) / 100;
    const traditionalFee = (inputs.salePrice * inputs.traditionalAgentPct) / 100;
    const listPathFee = (inputs.salePrice * inputs.listPathPct) / 100;

    const proceedsTraditional =
      inputs.salePrice - inputs.mortgagePayoff - closingCosts - traditionalFee;
    const proceedsListPath =
      inputs.salePrice - inputs.mortgagePayoff - closingCosts - listPathFee;

    const equityRetained = Math.max(0, proceedsListPath - proceedsTraditional);

    const retainedRatio =
      traditionalFee <= 0 ? 1 : Math.min(1, Math.max(0, equityRetained / traditionalFee));

    return {
      closingCosts,
      traditionalFee,
      listPathFee,
      proceedsTraditional,
      proceedsListPath,
      equityRetained,
      retainedRatio,
    };
  }, [inputs]);

  return (
    <div className="glass-surface-strong p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-semibold tracking-widest text-white/60">
              NET PROCEEDS CALCULATOR
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Simulate your equity retention.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Slide the sale price. Watch retained equity grow. Swap in your exact
              cost model later without touching UI.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-mono text-white/50">Sale price</div>
            <div className="mt-1 font-mono text-lg font-semibold text-white">
              {formatMoney(inputs.salePrice)}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="flex items-center justify-between text-xs font-semibold tracking-widest text-white/60">
            <span>SALE PRICE</span>
            <span className="font-mono text-white/80">{formatMoney(salePrice)}</span>
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

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-widest text-white/60">
                  EQUITY RETAINED
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  <span className="text-glow">{formatMoney(result.equityRetained)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-white/50">Model</div>
                <div className="mt-1 text-sm font-semibold text-white/80">
                  ListPath 1.0% vs Trad 3.0%
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(result.retainedRatio * 100)}%`,
                    background:
                      "linear-gradient(90deg, rgba(68,255,154,1), rgba(59,130,246,1))",
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                <span>Traditional fee leakage</span>
                <span className="font-mono">
                  {Math.round(result.retainedRatio * 100)}% recaptured
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-surface p-4">
              <div className="text-xs font-semibold tracking-widest text-white/60">
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
            <div className="glass-surface p-4">
              <div className="text-xs font-semibold tracking-widest text-white/60">
                LISTPATH PATH
              </div>
              <div className="mt-3 grid gap-1 text-sm">
                <Row label="Platform fee" value={formatMoney(result.listPathFee)} />
                <Row label="Closing costs" value={formatMoney(result.closingCosts)} />
                <Row label="Mortgage payoff" value={formatMoney(inputs.mortgagePayoff)} />
                <Row
                  label="Net proceeds"
                  value={formatMoney(result.proceedsListPath)}
                  strong
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-white/50">
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
    <div className="flex items-center justify-between gap-3">
      <span className={strong ? "text-white" : "text-white/70"}>{label}</span>
      <span className={["font-mono", strong ? "text-white" : "text-white/80"].join(" ")}>
        {value}
      </span>
    </div>
  );
}

