/** Placeholder body for legacy static blog entries without DB content. */
export function BlogStaticFallbackBody() {
  return (
    <div className="space-y-4 text-sm text-white/80">
      <p>
        This article summarizes a practical workflow for Texas sellers preparing to list through a
        licensed brokerage.
      </p>
      <p>
        Use these steps to organize disclosures, streamline review, and improve listing launch quality.
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs font-semibold tracking-widest text-white/60">
          CONTROLLER CHECKLIST
        </div>
        <ul className="mt-3 grid gap-2">
          <li>Confirm asset integrity (photos, specs, disclosures).</li>
          <li>Run compliance audit (TREC + broker validation).</li>
          <li>Launch listing + verify links, tracking, and calls-to-action.</li>
        </ul>
      </div>
    </div>
  );
}
