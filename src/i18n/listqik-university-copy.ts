import type { HomeLocale } from "@/i18n/home-locale";

export type ListqikUniversityCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  channelCta: string;
  subscribe: string;
  whatYouLearnTitle: string;
  topics: Array<{ title: string; body: string }>;
  latestTitle: string;
  latestHint: string;
  emptyTitle: string;
  emptyBody: string;
  watchOnYoutube: string;
  updatedNote: string;
  featuredLabel: string;
  languageFilterLabel: string;
  allLanguagesLabel: string;
  otherLanguagesLabel: string;
  showingLanguageLabel: string;
  noLanguageMatchTitle: string;
  noLanguageMatchBody: string;
};

const COPY: Record<HomeLocale, ListqikUniversityCopy> = {
  en: {
    eyebrow: "LISTQIK UNIVERSITY",
    title: "Learn listing, pricing, and compliance on our YouTube channel.",
    intro:
      "ListQik University is your free video library from the List Quick channel on YouTube. Watch walkthroughs on flat-fee listings, MLS prep, disclosures, and how to get the most from ListQik.com — new episodes appear here automatically when we publish.",
    channelCta: "Visit the channel",
    subscribe: "Subscribe on YouTube",
    whatYouLearnTitle: "What you will learn",
    topics: [
      {
        title: "How ListQik works",
        body: "Step-by-step tours of the seller dashboard, intake flow, and what happens after checkout.",
      },
      {
        title: "Pricing and plans",
        body: "Compare Subsonic, Sonic, and Supersonic tiers and understand which add-ons fit your listing.",
      },
      {
        title: "MLS and marketing",
        body: "Photos, remarks, showings, and upgrades that help your home stand out in Texas markets.",
      },
      {
        title: "Texas compliance",
        body: "Disclosures, fair housing, IABS, and broker review — explained in plain language.",
      },
    ],
    latestTitle: "Latest videos",
    latestHint: "Browse recent uploads from @ListQuick.",
    emptyTitle: "Videos are on the way",
    emptyBody:
      "The channel is live but has no public uploads in the feed yet. Subscribe on YouTube to get notified when the first lessons drop.",
    watchOnYoutube: "Watch on YouTube",
    updatedNote: "Auto-updated from YouTube",
    featuredLabel: "Latest episode",
    languageFilterLabel: "Filter by video language",
    allLanguagesLabel: "All languages",
    otherLanguagesLabel: "Other",
    showingLanguageLabel: "Showing videos in",
    noLanguageMatchTitle: "No videos yet in your selected language",
    noLanguageMatchBody:
      "We are only showing videos that match your current site language. Switch EN/ES at the top of the site or visit the channel to browse everything on YouTube.",
  },
  es: {
    eyebrow: "UNIVERSIDAD LISTQIK",
    title: "Aprenda publicación, precios y cumplimiento en nuestro canal de YouTube.",
    intro:
      "Universidad ListQik es su biblioteca gratuita de videos del canal List Quick en YouTube. Vea recorridos sobre publicaciones de tarifa fija, preparación MLS, divulgaciones y cómo aprovechar ListQik.com — los episodios nuevos aparecen aquí automáticamente cuando publicamos.",
    channelCta: "Visitar el canal",
    subscribe: "Suscribirse en YouTube",
    whatYouLearnTitle: "Qué aprenderá",
    topics: [
      {
        title: "Cómo funciona ListQik",
        body: "Recorridos del panel del vendedor, flujo de ingreso y qué ocurre después del pago.",
      },
      {
        title: "Precios y planes",
        body: "Compare niveles Subsonic, Sonic y Supersonic y qué complementos convienen a su propiedad.",
      },
      {
        title: "MLS y marketing",
        body: "Fotos, observaciones públicas, visitas y mejoras para destacar en mercados de Texas.",
      },
      {
        title: "Cumplimiento en Texas",
        body: "Divulgaciones, vivienda justa, IABS y revisión del corredor — explicado en lenguaje claro.",
      },
    ],
    latestTitle: "Videos recientes",
    latestHint: "Explore las publicaciones recientes de @ListQuick.",
    emptyTitle: "Los videos están en camino",
    emptyBody:
      "El canal está activo pero aún no hay subidas públicas en el feed. Suscríbase en YouTube para recibir aviso cuando salgan las primeras lecciones.",
    watchOnYoutube: "Ver en YouTube",
    updatedNote: "Actualizado automáticamente desde YouTube",
    featuredLabel: "Episodio más reciente",
    languageFilterLabel: "Filtrar por idioma del video",
    allLanguagesLabel: "Todos los idiomas",
    otherLanguagesLabel: "Otros",
    showingLanguageLabel: "Mostrando videos en",
    noLanguageMatchTitle: "Todavia no hay videos en el idioma seleccionado",
    noLanguageMatchBody:
      "Solo mostramos videos que coinciden con el idioma actual del sitio. Cambie EN/ES en la parte superior del sitio o visite el canal para ver todo en YouTube.",
  },
};

export function getListqikUniversityCopy(locale: HomeLocale): ListqikUniversityCopy {
  return COPY[locale] ?? COPY.en;
}
