"use client";

import { useEffect, useRef, useState } from "react";

type CockpitGaugeProps = {
  label: string;
  sublabel?: string;
  value: number; // 0–100
  size?: "sm" | "md" | "lg";
  accent?: "emerald" | "cyan" | "amber" | "magenta";
};

const accentMap = {
  emerald: { stroke: "#34d399", glow: "rgba(52, 211, 153, 0.55)" },
  cyan: { stroke: "#22d3ee", glow: "rgba(34, 211, 238, 0.55)" },
  amber: { stroke: "#fbbf24", glow: "rgba(251, 191, 36, 0.5)" },
  magenta: { stroke: "#e879f9", glow: "rgba(232, 121, 249, 0.45)" },
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Arc gauge 0–100 (RPM-style), ~240° sweep; needle “revs” on hover */
export function CockpitGauge({
  label,
  sublabel = "RPM",
  value,
  size = "md",
  accent = "emerald",
}: CockpitGaugeProps) {
  const filterId = `glow-${accent}-${size}-${label.replace(/\s+/g, "-")}`;
  const base = clamp(value, 0, 100);
  const revBoost = size === "lg" ? 26 : 22;

  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const hoveredRef = useRef(false);
  const [displayV, setDisplayV] = useState(base);
  const displayRef = useRef(base);

  const isActive = hovered || pressed;
  const target = isActive ? clamp(base + revBoost, 0, 100) : base;

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    displayRef.current = displayV;
  }, [displayV]);

  useEffect(() => {
    if (!hoveredRef.current) {
      displayRef.current = base;
      setDisplayV(base);
    }
  }, [base]);

  useEffect(() => {
    let raf: number;
    function loop() {
      const d = displayRef.current;
      const next = d + (target - d) * 0.16;
      const settled = Math.abs(target - next) < 0.2;
      displayRef.current = settled ? target : next;
      setDisplayV(displayRef.current);
      if (!settled) {
        raf = requestAnimationFrame(loop);
      }
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const v = clamp(displayV, 0, 100);
  const dim = size === "lg" ? 200 : size === "md" ? 160 : 128;
  const cx = dim / 2;
  const cy = dim / 2 + (size === "sm" ? 4 : 8);
  const r = size === "lg" ? 72 : size === "md" ? 58 : 46;
  const { stroke, glow } = accentMap[accent];

  const startDeg = 210;
  const sweep = 240;
  const needleDeg = startDeg - (v / 100) * sweep;

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const polar = (deg: number, radius: number) => ({
    x: cx + radius * Math.cos(rad(deg)),
    y: cy - radius * Math.sin(rad(deg)),
  });

  const arcStart = polar(startDeg, r);
  const arcEnd = polar(startDeg - sweep, r);
  const arcEndV = polar(needleDeg, r);
  const deltaDeg = (v / 100) * sweep;
  const largeArc = deltaDeg > 180 ? 1 : 0;

  const ticks = [0, 25, 50, 75, 100];
  const needleLen = r - 6;
  const tip = polar(needleDeg, needleLen);

  return (
    <div
      className="group flex flex-col items-center rounded-xl p-2 transition-[transform,filter] duration-200 ease-out hover:scale-[1.05]"
      style={{ width: dim, minWidth: dim }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => {
        setHovered(false);
        setPressed(false);
      }}
      tabIndex={0}
    >
      <svg
        width={dim}
        height={dim * 0.72}
        viewBox={`0 0 ${dim} ${dim * 0.72}`}
        className="overflow-visible transition-[filter] duration-200 group-hover:brightness-110"
        aria-hidden
      >
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 1 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke="rgba(15, 23, 42, 0.9)"
          strokeWidth={size === "sm" ? 8 : 10}
          strokeLinecap="round"
        />
        {v > 0 ? (
          <path
            d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${largeArc} 1 ${arcEndV.x} ${arcEndV.y}`}
            fill="none"
            stroke={stroke}
            strokeWidth={size === "sm" ? 3 : 4}
            strokeLinecap="round"
            filter={`url(#${filterId})`}
            opacity={hovered ? 1 : 0.95}
            className="transition-opacity duration-200"
          />
        ) : null}
        {ticks.map((t) => {
          const d = startDeg - (t / 100) * sweep;
          const outer = polar(d, r + 2);
          const inner = polar(d, r - (size === "sm" ? 10 : 12));
          return (
            <line
              key={t}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(148, 163, 184, 0.55)"
              strokeWidth={1}
            />
          );
        })}
        <line
          x1={cx}
          y1={cy}
          x2={tip.x}
          y2={tip.y}
          stroke={stroke}
          strokeWidth={size === "sm" ? 2 : 3}
          strokeLinecap="round"
          filter={`url(#${filterId})`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={size === "sm" ? 4 : 5}
          fill="#0f172a"
          stroke={stroke}
          strokeWidth={1.5}
        />
      </svg>
      <div className="-mt-1 text-center">
        <div
          className="font-mono text-[10px] font-bold tracking-[0.2em] sm:text-[11px]"
          style={{ color: stroke, textShadow: `0 0 12px ${glow}` }}
        >
          {label}
        </div>
        <div className="font-mono text-[9px] tracking-widest text-slate-500">{sublabel}</div>
        <div
          className="mt-0.5 font-mono text-lg font-bold tabular-nums text-white transition-[text-shadow,color] duration-200 sm:text-xl"
          style={{
            color: isActive ? stroke : undefined,
            textShadow: isActive
              ? `0 0 24px ${glow}, 0 0 8px ${glow}`
              : `0 0 20px ${glow}`,
          }}
        >
          {Math.round(v)}
        </div>
      </div>
    </div>
  );
}
