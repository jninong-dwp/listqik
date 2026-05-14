/** Seller-facing acknowledgement of Central Metro Realty branding and MLS advertising rules. */
export function BrokerBrandingContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Central Metro Realty is the broker of record for this listing. Texas Real Estate Commission
        (TREC) advertising rules and MLS Public Remarks rules require specific broker attribution
        on all marketing materials and the MLS. This page summarizes the obligations you are
        acknowledging when you check the &quot;Broker branding / advertising rules confirmed&quot;
        box during listing setup.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Signage &amp; digital ads</h2>
        <p>
          All advertisements — including yard signs, social media posts, flyers, digital banners,
          and email campaigns — must prominently display{" "}
          <span className="font-semibold text-white">&quot;Central Metro Realty&quot;</span> in a
          font size at least <span className="font-semibold text-white">50%</span> of the size of
          the ListQik logo or your contact information, whichever is larger.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">No direct contact in MLS Public Remarks</h2>
        <p>
          TREC and MLS rules prohibit placing your personal phone number, email address, website,
          or &quot;Listqik.com&quot; in the{" "}
          <span className="font-semibold text-white">Public Remarks</span> section of the MLS.
          Public Remarks describe the property only. Showing instructions, contact details, and
          access codes belong in agent-only fields (Private Remarks, Showing Instructions).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Compliance review</h2>
        <p>
          ListQik reserves the right to edit or remove any media or text that violates TREC
          advertising standards or MLS Rules. This includes — but is not limited to — adjusting
          public remarks, removing prohibited contact information, replacing photos that contain
          signage, and pausing the listing until a violation is corrected.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Why this matters</h2>
        <p>
          Improper broker attribution can result in MLS fines, listing suspension, and TREC
          complaints. The seller, the broker, and ListQik are all exposed when advertising rules
          are ignored — keeping Central Metro Realty visible on every channel protects everyone.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-amber-400/25 bg-amber-950/15 p-5">
        <h2 className="text-base font-semibold text-amber-100">Acknowledgement</h2>
        <p className="text-amber-50/90">
          By checking the &quot;Broker branding / advertising rules confirmed&quot; box in your
          listing setup, you confirm that you have read these rules, you agree to display Central
          Metro Realty on all advertising at the required size, you agree to keep direct contact
          out of MLS Public Remarks, and you authorize ListQik to edit non-compliant content.
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        See also the{" "}
        <a
          href="/resources/legal/mls-rules-and-regulations"
          className="underline underline-offset-2 hover:text-white/80"
        >
          MLS Rules and Regulations
        </a>{" "}
        and the{" "}
        <a
          href="/resources/legal/mls-rule-schedule-of-fines"
          className="underline underline-offset-2 hover:text-white/80"
        >
          MLS Rule Schedule of Fines
        </a>{" "}
        for the full text of governing rules and administrative sanctions.
      </p>
    </div>
  );
}
