const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://listqik.com";

type BreadcrumbItem = { name: string; path: string };

type LocationSeoJsonLdProps = {
  pageTitle: string;
  pageDescription: string;
  canonicalPath: string;
  breadcrumbs: BreadcrumbItem[];
  countyName?: string;
  cityName?: string;
};

export function LocationSeoJsonLd({
  pageTitle,
  pageDescription,
  canonicalPath,
  breadcrumbs,
  countyName,
  cityName,
}: LocationSeoJsonLdProps) {
  const url = `${siteUrl}${canonicalPath}`;
  const areaName = cityName
    ? `${cityName}, ${countyName} County, TX`
    : countyName
      ? `${countyName} County, TX`
      : "Texas";

  const graph = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: pageTitle,
      description: pageDescription,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.path}`,
      })),
    },
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: "ListQik Texas home listing",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: {
        "@type": "AdministrativeArea",
        name: areaName,
        containedInPlace: { "@type": "State", name: "Texas" },
      },
      serviceType: "Broker-assisted MLS home listing",
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}
