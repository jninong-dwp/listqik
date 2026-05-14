import Link from "next/link";

const SPONSORING_BROKER = {
  name: "Central Metro Realty",
  license: "588680",
  email: "broker@centralmetro.com",
  phone: "737-249-9010",
};

const DESIGNATED_BROKER = {
  name: "Jason Huval",
  license: "561230",
  email: "broker@centralmetro.com",
  phone: "737-249-9010",
};

const LICENSED_SUPERVISOR = {
  name: "Vito Raymond",
  license: "637846",
  email: "broker@centralmetro.com",
  phone: "737-249-9010",
};

/** Substance of the TREC IABS form (rev. 11-03-2025) with firm-specific contact information. */
export function IabsContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Texas law requires all real estate license holders to give the following information about
        brokerage services to prospective buyers, tenants, sellers, and landlords.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Types of real estate license holders</h2>
        <ul className="list-disc space-y-2 pl-5 text-white/85 marker:text-emerald-300/70">
          <li>
            A <span className="font-semibold text-white">BROKER</span> is responsible for all
            brokerage activities, including acts performed by sales agents sponsored by the broker.
          </li>
          <li>
            A <span className="font-semibold text-white">SALES AGENT</span> must be sponsored by a
            broker and works with clients on behalf of the broker.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          A broker&apos;s minimum duties required by law
        </h2>
        <p className="text-muted">
          A client is the person or party that the broker represents.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-white/85 marker:text-emerald-300/70">
          <li>Put the interests of the client above all others, including the broker&apos;s own interests;</li>
          <li>
            Inform the client of any material information about the property or transaction
            received by the broker;
          </li>
          <li>Answer the client&apos;s questions and present any offer to or counter-offer from the client; and</li>
          <li>Treat all parties to a real estate transaction honestly and fairly.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          Written agreements are required in certain situations
        </h2>
        <p>
          A license holder who performs brokerage activity for a prospective buyer of residential
          property must enter into a written agreement with the buyer before showing any
          residential property to the buyer or, if no residential property will be shown, before
          presenting an offer on behalf of the buyer. This written agreement must contain specific
          information required by Texas law. For more information on these requirements, see
          section 1101.563 of the Texas Occupations Code.
        </p>
        <p>
          Even if a written agreement is not required, to avoid disputes, all agreements between
          you and a broker should be in writing and clearly establish: (i) the broker&apos;s duties
          and responsibilities to you and your obligations under the agreement; and (ii) the amount
          or rate of compensation the broker will receive and how this amount is determined.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-white">
          A license holder can represent a party in a real estate transaction
        </h2>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-emerald-100">
            As agent for owner (seller / landlord)
          </h3>
          <p>
            The broker becomes the property owner&apos;s agent through an agreement with the owner,
            usually in a written listing to sell or property management agreement. An owner&apos;s
            agent must perform the broker&apos;s minimum duties above and must inform the owner of
            any material information about the property or transaction known by the agent,
            including information disclosed to the agent by the buyer or buyer&apos;s agent. An
            owner&apos;s agent fees are not set by law and are fully negotiable.
          </p>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-emerald-100">As agent for buyer / tenant</h3>
          <p>
            The broker becomes the buyer/tenant&apos;s agent by agreeing to represent the buyer,
            usually through a written representation agreement. A buyer&apos;s agent must perform
            the broker&apos;s minimum duties above and must inform the buyer of any material
            information about the property or transaction known by the agent, including information
            disclosed to the agent by the seller or seller&apos;s agent. A buyer/tenant&apos;s
            agent fees are not set by law and are fully negotiable.
          </p>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-emerald-100">As agent for both — intermediary</h3>
          <p>
            To act as an intermediary between the parties the broker must first obtain the written
            agreement of each party to the transaction. The written agreement must state who will
            pay the broker and, in conspicuous bold or underlined print, set forth the broker&apos;s
            obligations as an intermediary. A broker who acts as an intermediary:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-white/85 marker:text-emerald-300/70">
            <li>Must treat all parties to the transaction impartially and fairly;</li>
            <li>
              May, with the parties&apos; written consent, appoint a different license holder
              associated with the broker to each party (owner and buyer) to communicate with,
              provide opinions and advice to, and carry out the instructions of each party to the
              transaction;
            </li>
            <li>
              Must not, unless specifically authorized in writing to do so by the party, disclose:
              <ul className="mt-2 list-[circle] space-y-1 pl-6 text-white/80 marker:text-white/40">
                <li>that the owner will accept a price less than the written asking price;</li>
                <li>
                  that the buyer/tenant will pay a price greater than the price submitted in a
                  written offer; and
                </li>
                <li>
                  any confidential information or any other information that a party specifically
                  instructs the broker in writing not to disclose, unless required to do so by law.
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          A license holder can show property to a buyer / tenant without representing the buyer / tenant if:
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-white/85 marker:text-emerald-300/70">
          <li>
            The broker has not agreed with the buyer/tenant, either orally or in writing, to
            represent the buyer/tenant;
          </li>
          <li>The broker is not otherwise acting as the buyer/tenant&apos;s agent at the time of showing the property;</li>
          <li>
            The broker does not provide the buyer/tenant opinions or advice regarding the property
            or real estate transactions generally; and
          </li>
          <li>The broker does not perform any other act of real estate brokerage for the buyer/tenant.</li>
        </ul>
        <p>
          Before showing a residential property to an unrepresented prospective buyer, a license
          holder must enter into a written agreement that contains the information required by
          section 1101.563 of the Texas Occupations Code. The agreement may not be exclusive and
          must be limited to no more than 14 days.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-5">
        <header className="space-y-1">
          <h2 className="text-base font-semibold text-emerald-100">License holder contact information</h2>
          <p className="text-xs text-white/60">
            This notice is being provided for information purposes. It does not create an obligation
            for you to use the broker&apos;s services. Please acknowledge receipt of this notice and
            retain a copy for your records.
          </p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-xs text-white/85">
            <thead>
              <tr className="border-b border-emerald-500/25 text-left text-emerald-200/85">
                <th scope="col" className="py-2 pr-3 font-semibold">Role</th>
                <th scope="col" className="px-3 py-2 font-semibold">Name</th>
                <th scope="col" className="px-3 py-2 font-semibold">License #</th>
                <th scope="col" className="px-3 py-2 font-semibold">Email</th>
                <th scope="col" className="px-3 py-2 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-medium text-white/80">
                  Sponsoring Broker
                  <span className="block text-[10px] font-normal text-white/55">
                    (Licensed business entity)
                  </span>
                </th>
                <td className="px-3 py-2">{SPONSORING_BROKER.name}</td>
                <td className="px-3 py-2 font-mono">{SPONSORING_BROKER.license}</td>
                <td className="px-3 py-2 break-all">
                  <a
                    href={`mailto:${SPONSORING_BROKER.email}`}
                    className="text-emerald-300/90 underline underline-offset-2 hover:text-white"
                  >
                    {SPONSORING_BROKER.email}
                  </a>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <a
                    href={`tel:+1${SPONSORING_BROKER.phone.replace(/[^0-9]/g, "")}`}
                    className="text-emerald-300/90 hover:text-white"
                  >
                    {SPONSORING_BROKER.phone}
                  </a>
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-medium text-white/80">
                  Designated Broker
                  <span className="block text-[10px] font-normal text-white/55">
                    (of business entity)
                  </span>
                </th>
                <td className="px-3 py-2">{DESIGNATED_BROKER.name}</td>
                <td className="px-3 py-2 font-mono">{DESIGNATED_BROKER.license}</td>
                <td className="px-3 py-2 break-all">
                  <a
                    href={`mailto:${DESIGNATED_BROKER.email}`}
                    className="text-emerald-300/90 underline underline-offset-2 hover:text-white"
                  >
                    {DESIGNATED_BROKER.email}
                  </a>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <a
                    href={`tel:+1${DESIGNATED_BROKER.phone.replace(/[^0-9]/g, "")}`}
                    className="text-emerald-300/90 hover:text-white"
                  >
                    {DESIGNATED_BROKER.phone}
                  </a>
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-medium text-white/80">
                  Licensed Supervisor
                  <span className="block text-[10px] font-normal text-white/55">
                    of sales agent / associate
                  </span>
                </th>
                <td className="px-3 py-2">{LICENSED_SUPERVISOR.name}</td>
                <td className="px-3 py-2 font-mono">{LICENSED_SUPERVISOR.license}</td>
                <td className="px-3 py-2 break-all">
                  <a
                    href={`mailto:${LICENSED_SUPERVISOR.email}`}
                    className="text-emerald-300/90 underline underline-offset-2 hover:text-white"
                  >
                    {LICENSED_SUPERVISOR.email}
                  </a>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <a
                    href={`tel:+1${LICENSED_SUPERVISOR.phone.replace(/[^0-9]/g, "")}`}
                    className="text-emerald-300/90 hover:text-white"
                  >
                    {LICENSED_SUPERVISOR.phone}
                  </a>
                </td>
              </tr>
              <tr>
                <th scope="row" className="py-2 pr-3 text-left font-medium text-white/80">
                  Sales Agent / Associate
                </th>
                <td className="px-3 py-2 text-white/55" colSpan={4}>
                  Provided per transaction (when applicable).
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-white/55">
          Regulated by the Texas Real Estate Commission. Information available at{" "}
          <a
            href="https://www.trec.texas.gov/"
            target="_blank"
            rel="noreferrer noopener"
            className="text-emerald-300/90 underline underline-offset-2 hover:text-white"
          >
            www.trec.texas.gov
          </a>
          . Form rev. 11-03-2025 · IABS 1-2.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-amber-400/25 bg-amber-950/15 p-5">
        <h2 className="text-base font-semibold text-amber-100">Acknowledgement</h2>
        <p className="text-amber-50/90">
          By checking the &quot;Information About Brokerage Services (IABS) acknowledged&quot; box
          in your listing setup, you confirm that you have received and read this notice and you
          retain a copy for your records.
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
          from TREC, which describes regulatory oversight, complaints, and related consumer
          resources.
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        This page reproduces the substance of the TREC Information About Brokerage Services form
        (rev. 11-03-2025) with the firm-specific contact information for Central Metro Realty. For
        the official current PDF, see{" "}
        <a
          href="https://www.trec.texas.gov/forms/information-about-brokerage-services"
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-2 hover:text-white/80"
        >
          TREC — Information About Brokerage Services
        </a>
        .
      </p>
    </div>
  );
}
