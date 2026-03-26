import type { Listing } from "./types";

export const listings: Listing[] = [
  {
    slug: "austin-78704-south-lamar-glass-loft",
    title: "South Lamar Glass Loft",
    city: "Austin",
    state: "TX",
    neighborhood: "78704",
    price: 725000,
    beds: 2,
    baths: 2,
    sqft: 1240,
    status: "active",
    type: "condo",
    featured: true,
    tags: ["walkable", "modern", "views"],
    heroImage: {
      src: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
      alt: "Modern condo interior with glass and neon city glow",
    },
    summary:
      "A dark-glass, high-contrast condo with clean lines and a layout optimized for WFH and hosting.",
  },
  {
    slug: "dallas-75205-highland-park-cobalt",
    title: "Highland Park Cobalt",
    city: "Dallas",
    state: "TX",
    neighborhood: "75205",
    price: 1850000,
    beds: 4,
    baths: 4,
    sqft: 3320,
    status: "active",
    type: "single-family",
    tags: ["luxury", "schools", "quiet"],
    heroImage: {
      src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
      alt: "Luxury home exterior at dusk with clean lighting",
    },
    summary:
      "A tight, technical spec home with fast seller workflow support and deploy-ready marketing assets.",
  },
  {
    slug: "houston-77005-west-u-greenline",
    title: "West U Greenline",
    city: "Houston",
    state: "TX",
    neighborhood: "77005",
    price: 949000,
    beds: 3,
    baths: 3,
    sqft: 2190,
    status: "pending",
    type: "townhome",
    tags: ["low-maintenance", "close-in", "newer-build"],
    heroImage: {
      src: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80",
      alt: "Townhome interior with soft lighting",
    },
    summary:
      "A low-maintenance townhome with a timeline built for rapid deployment and clean buyer comms.",
  },
  {
    slug: "san-antonio-78209-alamo-heights-panel",
    title: "Alamo Heights Panel",
    city: "San Antonio",
    state: "TX",
    neighborhood: "78209",
    price: 615000,
    beds: 3,
    baths: 2,
    sqft: 1960,
    status: "active",
    type: "single-family",
    tags: ["classic", "updated", "yards"],
    heroImage: {
      src: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
      alt: "Updated home with crisp exterior lighting",
    },
    summary:
      "A clean, updated family home with broker-backed compliance and a no-drama selling workflow.",
  },
];

export const listingCities = ["Austin", "Dallas", "Houston", "San Antonio"] as const;
export type ListingCity = (typeof listingCities)[number];

