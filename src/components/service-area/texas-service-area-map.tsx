import {
  TEXAS_SERVICE_AREA_MAP,
  type TexasCountyMapData,
} from "@/lib/service-area";

const TIER_FILL: Record<"primary" | "extended" | "other", string> = {
  primary: "#8BE6A7",
  extended: "#1D4F7A",
  other: "#0D2339",
};

const TIER_STROKE: Record<"primary" | "extended" | "other", string> = {
  primary: "#DDFBE8",
  extended: "#7CCBDE",
  other: "#2A4661",
};

export function TexasServiceAreaMap({
  map = TEXAS_SERVICE_AREA_MAP,
  ariaLabel = "Texas county map showing primary and extended service areas",
}: {
  map?: TexasCountyMapData;
  ariaLabel?: string;
}) {
  const { width, height, statePath, counties } = map;

  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),rgba(4,10,19,0.98)_70%)] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:rounded-[1.75rem] sm:p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <rect width={width} height={height} fill="transparent" />
        {counties.map((county) => (
          <path
            key={county.name}
            d={county.path}
            fill={TIER_FILL[county.tier]}
            stroke={TIER_STROKE[county.tier]}
            strokeWidth={county.tier === "primary" ? 1.8 : 1}
            vectorEffect="non-scaling-stroke"
          >
            <title>{county.label}</title>
          </path>
        ))}
        {statePath ? (
          <path
            d={statePath}
            fill="none"
            stroke="#E8FFF2"
            strokeWidth={2.6}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
    </div>
  );
}
