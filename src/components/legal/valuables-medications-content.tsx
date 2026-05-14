/** Seller-facing notice covering protection of valuables, medications, weapons, and identity documents. */
export function ValuablesMedicationsContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Sellers are solely responsible for securing their property. Before any showing or open house,
        Seller agrees to take the precautions described below. ListQik.com and Central Metro Realty
        are not responsible for theft or damage to personal property left accessible during a
        showing.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Before any showing</h2>
        <ul className="list-disc space-y-2 pl-5 text-white/85 marker:text-emerald-300/70">
          <li>
            <span className="font-semibold text-white">Secure valuables.</span> Hide or remove
            jewelry, cash, watches, collectibles, and small electronics (laptops, tablets, gaming
            consoles).
          </li>
          <li>
            <span className="font-semibold text-white">Prescriptions.</span> Lock away all
            prescription medications — a high-theft item during open houses. Move them out of
            bathroom cabinets and nightstands.
          </li>
          <li>
            <span className="font-semibold text-white">Weapons.</span> Ensure all firearms and
            ammunition are locked in a safe or removed from the premises.
          </li>
          <li>
            <span className="font-semibold text-white">Identity.</span> Secure mail, bank
            statements, tax forms, passports, and any documents containing Social Security numbers,
            account numbers, or other personally identifiable information.
          </li>
          <li>
            <span className="font-semibold text-white">Keys & access devices.</span> Remove spare
            keys, garage remotes, and alarm codes from drawers, kitchen counters, and visible
            surfaces.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Limitation of liability</h2>
        <p>Seller agrees that ListQik.com and Central Metro Realty are not responsible for:</p>
        <ul className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70">
          <li>Theft or damage to personal property during showings or open houses.</li>
          <li>
            Legal claims arising from Seller&apos;s use of unauthorized audio or video recording
            (see the{" "}
            <a
              href="/resources/legal/security-surveillance"
              className="text-emerald-300/90 underline underline-offset-2 hover:text-white"
            >
              Security &amp; Surveillance Notice
            </a>
            ).
          </li>
          <li>Items the seller chose to leave in the home during marketing.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-amber-400/25 bg-amber-950/15 p-5">
        <h2 className="text-base font-semibold text-amber-100">Acknowledgement</h2>
        <p className="text-amber-50/90">
          By checking the &quot;Valuables / Medications Notice reviewed&quot; box in your listing
          setup, you confirm that you have read this notice and agree to secure valuables,
          medications, weapons, identity documents, and access devices before each showing.
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        This page summarizes seller responsibilities for property security during the listing
        period. It is not legal advice.
      </p>
    </div>
  );
}
