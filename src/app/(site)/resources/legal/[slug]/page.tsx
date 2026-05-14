import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { BrokerBrandingContent } from "@/components/legal/broker-branding-content";
import { ConsumerProtectionNoticeContent } from "@/components/legal/consumer-protection-notice-content";
import { FairHousingContent } from "@/components/legal/fair-housing-content";
import { IabsContent } from "@/components/legal/iabs-content";
import { MlsRulesAndRegulationsContent } from "@/components/legal/mls-rules-and-regulations-content";
import { MlsRuleScheduleOfFinesContent } from "@/components/legal/mls-rule-schedule-of-fines-content";
import { SecuritySurveillanceContent } from "@/components/legal/security-surveillance-content";
import { SellersDisclosureContent } from "@/components/legal/sellers-disclosure-content";
import { ValuablesMedicationsContent } from "@/components/legal/valuables-medications-content";
import { legalPages } from "@/data/resources";

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) return {};
  const isPlaceholder = slug === "privacy" || slug === "terms";
  return {
    title: page.title,
    alternates: {
      canonical: `/resources/legal/${page.slug}`,
    },
    robots: {
      index: !isPlaceholder,
      follow: true,
    },
    description:
      slug === "iabs"
        ? "Texas Information About Brokerage Services (IABS) for Resolution Realty Group and Central Metro Realty."
        : slug === "consumer-protection-notice"
          ? "Texas Real Estate Commission Consumer Protection Notice — key rights and resources."
        : slug === "mls-rules-and-regulations"
          ? "Full Texas REALTORS MLS Rules and Regulations document."
        : slug === "mls-rule-schedule-of-fines"
          ? "Texas REALTORS MLS Rule Schedule of Fines for administrative sanctions."
        : slug === "fair-housing"
          ? "Fair Housing rules and guidelines for listings, advertising, and conduct on ListQik.com."
        : slug === "valuables-medications"
          ? "Seller responsibilities for securing valuables, prescription medications, weapons, and identity documents during showings."
        : slug === "security-surveillance"
          ? "Texas audio recording law and surveillance disclosure obligations for property showings and open houses."
        : slug === "sellers-disclosure"
          ? "Texas Seller's Disclosure Notice duties, the ongoing duty to update, and previous repairs disclosure obligations."
        : slug === "broker-branding"
          ? "Central Metro Realty branding rules, MLS Public Remarks restrictions, and ListQik compliance review authority."
          : undefined,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) return notFound();

  return (
    <div className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-3">
            <div className="text-xs font-semibold tracking-widest text-white/60">
              RESOURCES · LEGAL
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {page.title}
            </h1>
            <p className="text-sm text-muted">
              Updated: <span className="font-mono text-white/70">{page.updatedAt}</span>
            </p>
          </header>

          <article className="glass-surface space-y-4 p-6 sm:p-8">
            {slug === "iabs" ? (
              <IabsContent />
            ) : slug === "consumer-protection-notice" ? (
              <ConsumerProtectionNoticeContent />
            ) : slug === "mls-rules-and-regulations" ? (
              <MlsRulesAndRegulationsContent />
            ) : slug === "mls-rule-schedule-of-fines" ? (
              <MlsRuleScheduleOfFinesContent />
            ) : slug === "fair-housing" ? (
              <FairHousingContent />
            ) : slug === "valuables-medications" ? (
              <ValuablesMedicationsContent />
            ) : slug === "security-surveillance" ? (
              <SecuritySurveillanceContent />
            ) : slug === "sellers-disclosure" ? (
              <SellersDisclosureContent />
            ) : slug === "broker-branding" ? (
              <BrokerBrandingContent />
            ) : (
              <div className="space-y-4 text-sm text-white/80">
                <p>
                  Placeholder legal text. Replace this content with your attorney-approved copy before
                  production.
                </p>
                <p className="text-muted">
                  Implementation note: keep legal routes stable for SEO and backlink durability.
                </p>
              </div>
            )}
          </article>
        </div>
      </Container>
    </div>
  );
}
