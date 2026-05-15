import Link from "next/link";

/** Website Terms and Conditions of Use for ListQik.com */
export function TermsContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        These Website Terms and Conditions of Use (&ldquo;Terms&rdquo;) govern your access to and use
        of ListQik.com (the &ldquo;Site&rdquo;), operated in connection with flat-fee home listing
        services provided through <strong className="text-white/90">Resolution Realty Group</strong>{" "}
        and its affiliated Texas brokerage, <strong className="text-white/90">Central Metro Realty</strong>
        . By accessing or using the Site, you agree to these Terms and to all applicable federal,
        state, and local laws and regulations. If you do not agree, do not use the Site.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">1. Acceptance of terms</h2>
        <p>
          By visiting the Site, creating an account, purchasing a plan, uploading content, or using
          any dashboard or listing tools, you represent that you are at least 18 years of age and
          have the legal capacity to enter into these Terms. These Terms apply to all visitors,
          sellers, and authorized users of the Site.
        </p>
        <p>
          Separate agreements may also apply to your transaction, including the{" "}
          <Link href="/listing-agreement" className="text-emerald-300 underline underline-offset-2">
            ListQik User Agreement
          </Link>
          , listing setup acknowledgements, Texas brokerage disclosures, and MLS rules. If there is a
          conflict between these Terms and a signed brokerage or listing agreement, the signed
          agreement controls for that transaction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">2. Nature of the service</h2>
        <p>
          ListQik.com provides marketing, technology, and workflow tools to help Texas home sellers
          work with a licensed real estate brokerage. ListQik.com is not itself a real estate
          brokerage. Brokerage services, when provided, are offered by Central Metro Realty and
          affiliated licensees in accordance with Texas law and applicable MLS rules.
        </p>
        <p>
          Information on the Site is for general educational and operational purposes. It is not
          legal, tax, or investment advice. You are responsible for the accuracy of information you
          submit and for complying with TREC requirements, MLS rules, fair housing laws, and local
          ordinances.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">3. Limited license to use the Site</h2>
        <p>
          We grant you a limited, non-exclusive, non-transferable, revocable license to access and use
          the Site for your personal or internal business use in connection with a legitimate
          listing or purchase through our platform. This license does not transfer ownership of any
          materials on the Site. Under this license, you may not:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70">
          <li>Copy, modify, distribute, or create derivative works from Site content except as expressly permitted;</li>
          <li>Use the Site or its materials for any unlawful purpose or in violation of MLS or brokerage rules;</li>
          <li>Scrape, crawl, or harvest data from the Site by automated means without our written consent;</li>
          <li>Attempt to decompile, reverse engineer, or extract source code from any software on the Site;</li>
          <li>Remove copyright, trademark, or other proprietary notices;</li>
          <li>Transfer access credentials or mirror Site content on another server without authorization.</li>
        </ul>
        <p>
          This license terminates automatically if you violate these restrictions and may be
          terminated by us at any time. Upon termination, you must cease use of the Site and destroy
          any materials you downloaded in violation of these Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">4. Accounts and security</h2>
        <p>
          You are responsible for maintaining the confidentiality of your login credentials and for
          all activity under your account. Notify us promptly at{" "}
          <a href="mailto:concierge@listqik.com" className="text-emerald-300 underline underline-offset-2">
            concierge@listqik.com
          </a>{" "}
          if you suspect unauthorized access. We may suspend or terminate accounts that appear
          compromised, fraudulent, or in violation of these Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">5. User content and photo uploads</h2>
        <p>
          You retain ownership of photos, documents, and other content you upload (&ldquo;User
          Content&rdquo;). By uploading User Content, you grant ListQik.com, Resolution Realty
          Group, and Central Metro Realty a non-exclusive license to host, display, reproduce, and
          distribute that content as needed to operate your listing, syndicate to permitted
          platforms, and comply with MLS and brokerage requirements.
        </p>
        <p>You represent and warrant that your User Content:</p>
        <ul className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70">
          <li>Is accurate and you have the right to use and publish it;</li>
          <li>Does not infringe any third-party intellectual property or privacy rights;</li>
          <li>Complies with Texas law, MLS photo rules, and our listing setup requirements (including exterior-first photos, no people/pets in marketing photos where required, and no unauthorized branding);</li>
          <li>Does not contain unlawful, misleading, discriminatory, or offensive material.</li>
        </ul>
        <p>
          We reserve the right to remove, reject, or edit any image or file that is inappropriate,
          non-compliant with state or MLS requirements, mislabeled, or otherwise necessary to
          protect users, the brokerage, or the platform. Removal of content does not entitle you to
          a refund except as required by applicable law or your purchase terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">6. Payments and third-party services</h2>
        <p>
          Plan fees, upgrades, and related charges are processed through third-party payment
          providers. Your use of those services may be subject to the provider&apos;s terms. We do not
          store full payment card numbers on our servers. Refund and cancellation policies, if any,
          are described at checkout or in your order confirmation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">7. Disclaimer of warranties</h2>
        <p>
          THE SITE AND ALL MATERIALS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE.&rdquo;
          TO THE FULLEST EXTENT PERMITTED BY LAW, LISTQIK.COM, RESOLUTION REALTY GROUP, CENTRAL METRO
          REALTY, AND THEIR OFFICERS, AGENTS, AND SUPPLIERS DISCLAIM ALL WARRANTIES, EXPRESS OR
          IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT.
        </p>
        <p>
          We do not warrant that the Site will be uninterrupted, error-free, or free of harmful
          components, or that listing results, showings, offers, or sale outcomes will meet your
          expectations. MLS participation, syndication timing, and market conditions are outside our
          control.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">8. Limitation of liability</h2>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, NEITHER LISTQIK.COM, RESOLUTION REALTY GROUP,
          CENTRAL METRO REALTY, NOR THEIR SUPPLIERS SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, GOODWILL, OR
          BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SITE, EVEN IF WE
          HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR YOUR USE OF THE SITE SHALL
          NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO US FOR THE SERVICE GIVING RISE TO THE
          CLAIM IN THE TWELVE (12) MONTHS BEFORE THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100).
        </p>
        <p className="text-white/70">
          Some jurisdictions do not allow certain warranty disclaimers or liability limitations; in
          those jurisdictions, our liability is limited to the maximum extent permitted by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">9. Revisions and errata</h2>
        <p>
          Materials on the Site may include technical, typographical, or photographic errors. We may
          change Site content, features, or pricing at any time without notice. We do not commit to
          updating all materials on a particular schedule, but we may revise these Terms from time
          to time by posting an updated version on this page.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">10. Links to other sites</h2>
        <p>
          The Site may link to third-party websites (including MLS portals, payment processors, and
          partner tools). We have not reviewed all linked sites and are not responsible for their
          content or practices. Inclusion of a link does not imply endorsement. Your use of linked
          sites is at your own risk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">11. Modifications to these Terms</h2>
        <p>
          We may revise these Terms at any time by posting the updated version on this page and
          updating the &ldquo;Updated&rdquo; date above. Your continued use of the Site after changes
          become effective constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">12. Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law
          principles. You agree that exclusive venue for disputes arising from these Terms or the
          Site shall be in state or federal courts located in Texas, and you consent to personal
          jurisdiction in those courts.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">13. Privacy</h2>
        <p>
          Our collection and use of personal information is described in our{" "}
          <Link href="/resources/legal/privacy" className="text-emerald-300 underline underline-offset-2">
            Privacy Policy
          </Link>
          , which is incorporated into these Terms by reference.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">14. Contact</h2>
        <p>
          Questions about these Terms may be directed to{" "}
          <a href="mailto:concierge@listqik.com" className="text-emerald-300 underline underline-offset-2">
            concierge@listqik.com
          </a>
          .
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        This document is provided for operational transparency. It is not a substitute for advice
        from your attorney. Have your counsel review before relying on it for compliance decisions.
      </p>
    </div>
  );
}
