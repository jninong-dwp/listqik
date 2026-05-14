/**
 * Combined "Security Notice" covering protection of valuables and medications, Texas audio
 * recording (wiretap) compliance, and the broker/firm limitation of liability that applies to
 * both. Linked to the `securitySurveillanceAcknowledged` checkbox in the listing-setup wizard.
 */
export function SecuritySurveillanceContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Sellers are solely responsible for securing their property. This Security Notice covers two
        related areas: (1) protecting valuables, medications, weapons, and identity documents
        during showings, and (2) complying with Texas audio recording (wiretap) laws when cameras
        or microphones are present on the property. By acknowledging this notice in your listing
        setup, you confirm that you have read both sections and agree to follow them.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          1. Protection of valuables &amp; medications
        </h2>
        <p>Before any showing or open house, Seller agrees to:</p>
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
            statements, tax forms, passports, and any documents containing Social Security
            numbers, account numbers, or other personally identifiable information.
          </li>
          <li>
            <span className="font-semibold text-white">Keys &amp; access devices.</span> Remove
            spare keys, garage remotes, and alarm codes from drawers, counters, and other visible
            surfaces.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          2. Audio &amp; video recording (Texas wiretap compliance)
        </h2>
        <p>
          Texas is a &quot;one-party consent&quot; state for audio recording, which means at least
          one party to a conversation must consent to it being recorded. Recording audio of buyers,
          their agents, or other entrants <em>without that consent</em> may violate federal and
          Texas wiretap laws (including the federal Wiretap Act and Texas Penal Code § 16.02) and
          expose the Seller to civil and criminal liability.
        </p>
        <p className="text-white/85">Seller acknowledges and agrees to:</p>
        <ul className="list-disc space-y-2 pl-5 text-white/85 marker:text-emerald-300/70">
          <li>
            Notify ListQik if there are active audio or video recording devices on the property
            (smart doorbells, indoor cameras, nanny cams, voice assistants with recording, etc.).
          </li>
          <li>
            Either <span className="font-semibold text-white">(a)</span> disable audio recording
            during showings and open houses, or{" "}
            <span className="font-semibold text-white">(b)</span> provide clear, conspicuous legal
            notice to all entrants — for example, a posted sign at every entrance stating the
            property is under audio &amp; video surveillance.
          </li>
          <li>
            Recognize that buyers and their agents have a reasonable expectation of privacy when
            discussing offers and personal financial matters during a showing.
          </li>
        </ul>
        <p className="text-muted">
          Recommended best practice: video-only recording (no audio) at a primary entry point is
          generally lower risk than full-room audio capture. If you are unsure whether a device is
          recording audio, disable it for the duration of any showing or open house, or remove it
          temporarily.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">3. Limitation of liability</h2>
        <p>Seller agrees that ListQik.com and Central Metro Realty are not responsible for:</p>
        <ul className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70">
          <li>Theft or damage to personal property during showings or open houses.</li>
          <li>Legal claims arising from Seller&apos;s use of unauthorized audio or video recording.</li>
          <li>Items the Seller chose to leave accessible in the home during marketing.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-5">
        <h2 className="text-base font-semibold text-emerald-100">
          Central Metro &amp; 2026 MLS best practices
        </h2>
        <p className="text-white/85">
          Central Metro Realty and the 2026 MLS rules require a recorded acknowledgement that the
          Seller has read this notice. In your listing setup, you will check a box that reads:
        </p>
        <blockquote className="rounded-xl border border-emerald-400/30 bg-black/30 p-4 text-emerald-50/95">
          &quot;I have read the Security &amp; Surveillance Notice and agree to secure my valuables
          and comply with Texas audio recording laws.&quot;
        </blockquote>
        <p className="text-xs text-white/55">
          That acknowledgement is recorded against your listing and reviewed by compliance before
          your listing is finalized.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-amber-400/25 bg-amber-950/15 p-5">
        <h2 className="text-base font-semibold text-amber-100">Acknowledgement</h2>
        <p className="text-amber-50/90">
          By checking the &quot;Security &amp; Surveillance Notice reviewed&quot; box in your
          listing setup, you confirm that you have read this notice in full, you agree to secure
          your valuables, medications, weapons, and identity documents before each showing, and
          you agree to comply with Texas audio recording laws on the property.
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        This page summarizes seller responsibilities for property security during the listing
        period and general considerations under Texas and federal recording laws. It is not legal
        advice. Consult a licensed Texas attorney for guidance specific to your situation.
      </p>
    </div>
  );
}
