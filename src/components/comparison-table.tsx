export function ComparisonTable() {
  return (
    <div className="glass-surface p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold tracking-widest text-white/60">
          COMPARISON SPEC SHEET
        </div>
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-white sm:text-2xl">
          ListQik.com vs. Houzeo / Beycome
        </h2>
        <p className="text-sm text-muted">
          Built for Texas sellers who want broker-backed compliance with a controller-grade workflow.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto overscroll-x-contain rounded-2xl border border-white/10 sm:mt-6">
        <p className="px-3 py-2 text-[11px] text-white/45 sm:hidden">
          Swipe sideways to see the full table.
        </p>
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm sm:min-w-[760px]">
          <thead>
            <tr className="bg-white/5">
              <Th>Capability</Th>
              <Th highlight>ListQik.com</Th>
              <Th>Houzeo</Th>
              <Th>Beycome</Th>
            </tr>
          </thead>
          <tbody>
            <Tr
              label="Local Texas broker support"
              lp="Included (TX-specific)"
              h="Varies / limited"
              b="Limited"
              emphasis
            />
            <Tr
              label="Rapid deployment SLA"
              lp="4-hour rapid deployment"
              h="Multi-day typical"
              b="Multi-day typical"
              emphasis
            />
            <Tr label="Workflow language" lp="Deploy listing · Audit compliance" h="List my home" b="Sell my home" />
            <Tr label="Compliance audit" lp="AI-assisted + broker review" h="Docs guidance" b="Docs guidance" />
            <Tr label="Listing performance telemetry" lp="Events-ready (pixel + UTM)" h="Basic" b="Basic" />
            <Tr label="Automation hooks" lp="GHL-ready architecture" h="Limited" b="Limited" />
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-white/50">
        This is a positioning spec sheet, not a legal claim matrix. Finalize features/pricing before publishing.
      </p>
    </div>
  );
}

function Th({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <th
      scope="col"
      className={[
        "px-4 py-3 font-semibold text-white/70",
        highlight ? "text-white" : "",
      ].join(" ")}
    >
      {children}
    </th>
  );
}

function Tr({
  label,
  lp,
  h,
  b,
  emphasis,
}: {
  label: string;
  lp: string;
  h: string;
  b: string;
  emphasis?: boolean;
}) {
  return (
    <tr className="border-t border-white/10">
      <td className="px-4 py-3 text-white/75">{label}</td>
      <td
        className={[
          "px-4 py-3",
          emphasis ? "text-white font-semibold" : "text-white/85",
        ].join(" ")}
      >
        {lp}
      </td>
      <td className="px-4 py-3 text-white/70">{h}</td>
      <td className="px-4 py-3 text-white/70">{b}</td>
    </tr>
  );
}

