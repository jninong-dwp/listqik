import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageBody } from "@/components/legal/legal-page-body";
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

  return {
    title: page.title,
    alternates: {
      canonical: `/es/resources/legal/${page.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    description:
      slug === "terms"
        ? "Website Terms and Conditions of Use for ListQik.com, Resolution Realty Group, and Central Metro Realty."
        : slug === "privacy"
          ? "How ListQik.com collects, uses, and protects your personal information."
          : slug === "iabs"
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

export default async function EsLegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) return notFound();

  return <LegalPageBody slug={slug} updatedAt={page.updatedAt} fallbackTitle={page.title} />;
}

