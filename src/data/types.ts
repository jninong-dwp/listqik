export type ListingStatus = "active" | "pending" | "sold";

export type ListingType = "single-family" | "condo" | "townhome" | "land";

export type Listing = {
  slug: string;
  title: string;
  city: string;
  state: "TX";
  neighborhood?: string;
  price: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  status: ListingStatus;
  type: ListingType;
  featured?: boolean;
  tags: string[];
  heroImage: {
    src: string;
    alt: string;
  };
  gallery?: { src: string; alt: string }[];
  summary: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  category: "playbooks" | "compliance" | "pricing" | "marketing";
  summary: string;
};

export type Video = {
  slug: string;
  title: string;
  youtubeId: string;
  topic: "market" | "strategy" | "compliance";
};

export type LegalPage = {
  slug: "privacy" | "terms";
  title: string;
  updatedAt: string; // ISO date
};
