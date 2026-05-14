/** Seller-facing acknowledgement covering Texas Seller's Disclosure Notice duties and the ongoing duty to disclose. */
export function SellersDisclosureContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Texas law requires a seller of residential property to provide a Seller&apos;s Disclosure
        Notice to a buyer (Tex. Prop. Code § 5.008). This page summarizes the duties you are
        acknowledging when you check the &quot;Seller&apos;s Disclosure Notice acknowledged&quot;
        box during listing setup.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Honesty &amp; completeness</h2>
        <p>
          I/We must disclose all known material defects and property conditions to the best of
          my/our knowledge. The notice is based on what the seller actually knows; it is not a
          warranty, but knowingly omitting a defect can create liability.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Ongoing duty to update</h2>
        <p>
          My duty to disclose continues until the day of closing. If a new issue arises after the
          notice is signed — for example, a roof leak during a storm, an HVAC failure, or a
          plumbing burst — I must update the disclosure promptly and provide the updated notice to
          the buyer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Liability</h2>
        <p>
          Failure to disclose known defects can lead to legal action under the Texas Deceptive
          Trade Practices Act (DTPA) and other consumer protection statutes. I acknowledge that
          ListQik.com and its brokers have not inspected the property and rely solely on my
          representations.
        </p>
      </section>

      <section className="space-y-3 border-t border-white/10 pt-5">
        <h2 className="text-base font-semibold text-white">Previous repairs &amp; ongoing duty</h2>
        <p>
          Texas law requires disclosure of all known previous repairs, even if the issue is
          believed to be fully resolved. This includes, but is not limited to:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-white/85 marker:text-emerald-300/70">
          <li>
            <span className="font-semibold text-white">Structural &amp; foundation.</span> Any
            history of leveling, pier installation, slab cracking, or foundation movement.
          </li>
          <li>
            <span className="font-semibold text-white">Water &amp; roof.</span> Any previous roof
            leaks, plumbing repairs, slab leaks, or water penetration into the structure.
          </li>
          <li>
            <span className="font-semibold text-white">Mechanical.</span> Major repairs to HVAC,
            electrical panels or wiring, water heaters, pool equipment, or spa systems.
          </li>
          <li>
            <span className="font-semibold text-white">Insurance claims.</span> Any claims filed
            for property damage (e.g., hail, fire, wind, freeze, or water damage), regardless of
            whether the funds were used for repairs.
          </li>
          <li>
            <span className="font-semibold text-white">Termites &amp; pests.</span> Any prior
            termite, wood-destroying insect, or rodent treatment, even when no current activity is
            present.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Documentation</h2>
        <p>
          I/We agree to provide copies of any available warranties, invoices, engineering reports,
          or structural reports for these repairs to the buyer. Keep records of contractors,
          dates, and scope of work — buyers and inspectors routinely request them.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-amber-400/25 bg-amber-950/15 p-5">
        <h2 className="text-base font-semibold text-amber-100">Acknowledgement</h2>
        <p className="text-amber-50/90">
          By checking the &quot;Seller&apos;s Disclosure Notice acknowledged&quot; box in your
          listing setup, you confirm that you have read and understand these duties and agree to
          provide a complete, current Seller&apos;s Disclosure Notice and to update it through the
          day of closing.
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        This page summarizes seller disclosure duties under Texas law. It is not legal advice. For
        the official form, see TREC OP-H (Seller&apos;s Disclosure Notice).
      </p>
    </div>
  );
}
