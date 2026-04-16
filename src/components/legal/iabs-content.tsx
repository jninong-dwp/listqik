import Link from "next/link";

/** TREC-style Information About Brokerage Services (substance of IABS; firm-specific details). */
export function IabsContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Texas law requires a real estate license holder who is a party to a transaction or acting as a
        broker or sales agent in a transaction to inform the other party in writing of the license
        holder&apos;s position in the transaction before the agreement of the parties. This notice is
        provided for that purpose and to satisfy related disclosure requirements.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">License holder / brokerage</h2>
        <ul className="list-inside list-disc space-y-2 text-white/80">
          <li>
            <span className="font-medium text-white/90">Brokerage (firm):</span> Resolution Realty Group
          </li>
          <li>
            <span className="font-medium text-white/90">Doing business as / brand:</span> Central Metro
            Realty; ListQik.com (marketing)
          </li>
          <li>
            <span className="font-medium text-white/90">License verification:</span> You may verify
            license status of brokers and sales agents at{" "}
            <a
              href="https://www.trec.texas.gov/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-emerald-300/90 underline underline-offset-2 hover:text-white"
            >
              www.trec.texas.gov
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Broker&apos;s minimum duties</h2>
        <p>
          A broker or sales agent who represents a party in a real estate transaction owes certain
          statutory duties to that party, including:
        </p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>Put the interests of the client above all others, including the license holder&apos;s own.</li>
          <li>
            Inform the client of any material information about the property or transaction known by the
            license holder.
          </li>
          <li>Answer the client&apos;s questions and present any offer to or counteroffer from the client.</li>
          <li>Treat all parties to a real estate transaction honestly and fairly.</li>
        </ul>
        <p className="text-muted">
          Additional duties may apply depending on whether you are represented and the nature of the
          relationship. Your written agreement with the brokerage should describe scope of services,
          compensation, and other material terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Representation and relationships</h2>
        <p>
          A license holder may represent a seller, landlord, buyer, or tenant. In some situations a
          broker may act as an intermediary between the parties, only with the written consent of each
          party and subject to applicable rules. Your broker should explain the options available in
          your situation before you are asked to sign an agreement or make material commitments.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Consumer Protection Notice</h2>
        <p>
          Texas law also requires that you receive the{" "}
          <Link
            href="/resources/legal/consumer-protection-notice"
            className="text-emerald-300/90 underline underline-offset-2 hover:text-white"
          >
            Consumer Protection Notice
          </Link>{" "}
          from TREC, which describes regulatory oversight, complaints, and related consumer resources.
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        This page summarizes common brokerage disclosure topics for Texas consumers and is provided for
        convenience. It is not legal advice. For the official TREC form PDFs, see{" "}
        <a
          href="https://www.trec.texas.gov/forms/information-about-brokerage-services"
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-2 hover:text-white/80"
        >
          TREC — Information About Brokerage Services
        </a>
        . Confirm licensee-specific information with your broker.
      </p>
    </div>
  );
}
