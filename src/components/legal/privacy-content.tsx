import Link from "next/link";

/** Privacy Policy for ListQik.com */
export function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Your privacy is important to us. This Privacy Policy explains how ListQik.com, Resolution
        Realty Group, and Central Metro Realty (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) collect, use, disclose, and protect personal information when you visit
        our website, create an account, purchase services, or use our listing tools.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Information we collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70">
          <li>
            <strong className="text-white/90">Account data</strong> — name, email, phone, login
            credentials, and agreement acknowledgements
          </li>
          <li>
            <strong className="text-white/90">Transaction data</strong> — plan selections, order
            references, payment status (processed by third-party payment providers; we do not store
            full card numbers)
          </li>
          <li>
            <strong className="text-white/90">Listing data</strong> — property address, description,
            photos, documents, disclosures, and MLS-related fields you submit
          </li>
          <li>
            <strong className="text-white/90">Communications</strong> — support messages, emails, and
            notifications you send or receive through the platform
          </li>
          <li>
            <strong className="text-white/90">Technical data</strong> — IP address, browser type,
            device information, cookies, and usage logs
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">How we use information</h2>
        <p>We collect and use personal information to:</p>
        <ul className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70">
          <li>Provide, operate, and improve the Site and your listing services</li>
          <li>Process orders, authenticate users, and communicate about your account</li>
          <li>Facilitate brokerage, MLS, and compliance workflows you request</li>
          <li>Send service-related notices, security alerts, and transactional email</li>
          <li>Detect fraud, enforce our policies, and comply with legal obligations</li>
          <li>Analyze aggregated usage to improve product quality (where permitted)</li>
        </ul>
        <p>
          We will identify the purposes for which information is collected before or at the time of
          collection and will use personal information only for purposes that are compatible with
          those purposes, unless we obtain your consent or are required by law to do otherwise.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Sharing and disclosure</h2>
        <p>We may share information with:</p>
        <ul className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70">
          <li>
            <strong className="text-white/90">Central Metro Realty</strong> and affiliated licensees
            for brokerage services you engage
          </li>
          <li>
            <strong className="text-white/90">MLS and syndication partners</strong> when you authorize
            listing distribution
          </li>
          <li>
            <strong className="text-white/90">Service providers</strong> such as hosting, email,
            payment, document storage, and analytics vendors under contractual safeguards
          </li>
          <li>
            <strong className="text-white/90">Legal authorities</strong> when required by law, court
            order, or to protect rights and safety
          </li>
        </ul>
        <p>We do not sell your personal information for monetary consideration.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Retention</h2>
        <p>
          We retain personal information only as long as necessary to fulfill the purposes described
          in this Policy, including satisfying legal, accounting, MLS, and brokerage record-keeping
          requirements. When information is no longer needed, we delete or de-identify it where
          feasible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Security</h2>
        <p>
          We protect personal information with reasonable administrative, technical, and physical
          safeguards designed to guard against loss, theft, and unauthorized access, disclosure,
          copying, use, or modification. No method of transmission over the Internet is completely
          secure; we cannot guarantee absolute security.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Your choices</h2>
        <p>
          You may update certain profile information from your dashboard. You may opt out of
          non-essential marketing email using unsubscribe links where provided. Some data cannot be
          deleted while an active listing or legal retention obligation exists.
        </p>
        <p>
          Texas residents and other users may have additional rights under applicable privacy laws.
          To submit a privacy request, contact{" "}
          <a href="mailto:concierge@listqik.com" className="text-emerald-300 underline underline-offset-2">
            concierge@listqik.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Cookies and analytics</h2>
        <p>
          We use cookies and similar technologies to maintain sessions, remember preferences, and
          measure Site performance. Third-party analytics or advertising tags (such as conversion
          tracking) may also be present. You can adjust browser settings to limit cookies, though
          some features may not function properly without them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Children</h2>
        <p>
          The Site is not directed to children under 13, and we do not knowingly collect personal
          information from children.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Policy updates</h2>
        <p>
          We may update this Privacy Policy from time to time. The revised version will be posted on
          this page with an updated date. Continued use of the Site after changes constitutes
          acceptance of the updated Policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Related policies</h2>
        <p>
          Your use of the Site is also governed by our{" "}
          <Link href="/resources/legal/terms" className="text-emerald-300 underline underline-offset-2">
            Terms of Service
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Contact</h2>
        <p>
          Questions about this Privacy Policy or our data practices may be sent to{" "}
          <a href="mailto:concierge@listqik.com" className="text-emerald-300 underline underline-offset-2">
            concierge@listqik.com
          </a>
          .
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        We are committed to managing personal information responsibly. Have your attorney review
        this Policy if you need counsel-specific compliance language.
      </p>
    </div>
  );
}
