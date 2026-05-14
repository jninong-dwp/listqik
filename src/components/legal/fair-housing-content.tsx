/** Plain-language summary of Fair Housing obligations for users of this platform. */
export function FairHousingContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        This website follows all applicable Fair Housing laws and regulations. Users, agents,
        brokers, and property owners must comply with federal, state, and local fair housing
        requirements when creating, marketing, or managing property listings.
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Protected classes</h2>
        <p>
          Discrimination is prohibited based on race, color, religion, sex, disability, familial
          status, national origin, gender identity, sexual orientation, or any additional protected
          class under applicable laws.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Advertising guidelines</h2>
        <p>
          Listings and advertisements must not contain discriminatory language, preferences,
          limitations, or exclusions. Avoid statements that imply preference for or against any
          protected group.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Equal opportunity</h2>
        <p>
          All applicants, buyers, renters, and tenants must be treated fairly and consistently
          throughout the transaction process.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Accessibility</h2>
        <p>
          Reasonable accommodations and modifications should be considered in accordance with fair
          housing and accessibility requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">Prohibited conduct</h2>
        <p>The following actions are prohibited:</p>
        <ul className="list-disc space-y-1 pl-5 text-white/80 marker:text-emerald-300/70">
          <li>Refusing to rent or sell housing based on protected characteristics</li>
          <li>Providing false information about availability</li>
          <li>Steering or discouraging buyers or renters</li>
          <li>Applying different terms or conditions unfairly</li>
          <li>Harassing or retaliating against individuals exercising fair housing rights</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">User responsibility</h2>
        <p>
          By using this platform, users agree to comply with all Fair Housing laws. Violations may
          result in listing removal, account suspension, or other appropriate action.
        </p>
      </section>

      <p className="border-t border-white/10 pt-4 text-xs text-white/50">
        For more information about Fair Housing laws, please consult the{" "}
        <a
          href="https://www.hud.gov/program_offices/fair_housing_equal_opp"
          target="_blank"
          rel="noreferrer noopener"
          className="underline underline-offset-2 hover:text-white/80"
        >
          U.S. Department of Housing and Urban Development (HUD)
        </a>{" "}
        or your local housing authority.
      </p>
    </div>
  );
}
