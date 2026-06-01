import { TEXAS_COUNTIES, TEXAS_LOCATION_STATS } from "@/lib/texas-location-seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://listqik.com";

/** Indexable location coverage for the main /service-area hub (no full city/county list in HTML). */
export function ServiceAreaHubJsonLd() {
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/service-area#webpage`,
      url: `${siteUrl}/service-area`,
      name: "ListQik Texas Service Area",
      description:
        "ListQik Texas home listing coverage including DFW primary counties, extended Texas support, and Houston HAR market reference.",
      isPartOf: { "@id": `${siteUrl}/#website` },
    },
    {
      "@type": "CollectionPage",
      "@id": `${siteUrl}/service-area/texas#collection`,
      url: `${siteUrl}/service-area/texas`,
      name: "Texas counties and cities",
      description: `Index of ${TEXAS_LOCATION_STATS.countyCount} Texas counties and ${TEXAS_LOCATION_STATS.cityCount} cities for ListQik listing support.`,
      numberOfItems: TEXAS_LOCATION_STATS.countyCount + TEXAS_LOCATION_STATS.cityCount,
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/service-area#county-list`,
      name: "Texas county pages",
      numberOfItems: TEXAS_COUNTIES.length,
      itemListElement: TEXAS_COUNTIES.slice(0, 50).map((county, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${county.county} County`,
        url: `${siteUrl}/service-area/texas/${county.countySlug}`,
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
