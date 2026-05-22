import type { HomeLocale } from "@/i18n/home-locale";

export type BlogsCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  open: string;
  empty: string;
  localeChip: { en: string; es: string };
  dateLocale: string;
};

const COPY: Record<HomeLocale, BlogsCopy> = {
  en: {
    metaTitle: "Blogs",
    metaDescription:
      "Read practical Texas home-selling guides on pricing, disclosures, and listing workflows.",
    eyebrow: "RESOURCES · BLOGS",
    title: "Playbooks for analytical sellers.",
    subtitle: "Practical guidance on pricing, compliance, and listing preparation.",
    open: "Open →",
    empty: "No articles in this language yet.",
    localeChip: { en: "EN", es: "ES" },
    dateLocale: "en-US",
  },
  es: {
    metaTitle: "Blog",
    metaDescription:
      "Guías prácticas para vender en Texas: precios, divulgaciones y preparación del listado.",
    eyebrow: "RECURSOS · BLOG",
    title: "Guías para vendedores analíticos.",
    subtitle: "Orientación práctica sobre precios, cumplimiento y preparación del listado.",
    open: "Abrir →",
    empty: "Aún no hay artículos en español.",
    localeChip: { en: "EN", es: "ES" },
    dateLocale: "es-US",
  },
};

export function getBlogsCopy(locale: HomeLocale): BlogsCopy {
  return COPY[locale] ?? COPY.en;
}
