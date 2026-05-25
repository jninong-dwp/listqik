import type { HomeLocale } from "@/i18n/home-locale";

export type SiteChromeCopy = {
  header: {
    navLabel: string;
    pricing: string;
    about: string;
    serviceArea: string;
    listings: string;
    portfolio: string;
    resources: string;
    university: string;
    dashboard: string;
    logIn: string;
    viewListings: string;
    startListing: string;
    logOut: string;
  };
  footer: {
    tagline: string;
    brokerSupport: string;
    product: string;
    resources: string;
    legal: string;
    pricing: string;
    listings: string;
    portfolio: string;
    blogs: string;
    videos: string;
    university: string;
    iabs: string;
    consumerProtection: string;
    mlsFines: string;
    mlsRules: string;
    fairHousing: string;
    privacy: string;
    terms: string;
    copyright: string;
    status: string;
    operational: string;
    centralMetroAlt: string;
  };
};

const COPY: Record<HomeLocale, SiteChromeCopy> = {
  en: {
    header: {
      navLabel: "Primary",
      pricing: "Pricing",
      about: "About",
      serviceArea: "Service Area",
      listings: "Listings",
      portfolio: "Portfolio",
      resources: "Resources",
      university: "University",
      dashboard: "Dashboard",
      logIn: "Log in",
      viewListings: "View Listings",
      startListing: "Start Listing",
      logOut: "Log out",
    },
    footer: {
      tagline:
        "A technical utility for deploying listings fast while retaining more equity.",
      brokerSupport: "Local Texas broker support · 4-hour rapid deployment",
      product: "Product",
      resources: "Resources",
      legal: "Legal",
      pricing: "Pricing",
      listings: "Listings",
      portfolio: "Portfolio",
      blogs: "Blogs",
      videos: "Videos",
      university: "ListQik University",
      iabs: "Information About Brokerage Services (IABS)",
      consumerProtection: "Consumer Protection Notice",
      mlsFines: "MLS Rule Schedule of Fines",
      mlsRules: "MLS Rules and Regulations",
      fairHousing: "Fair Housing",
      privacy: "Privacy",
      terms: "Terms",
      copyright: "All rights reserved.",
      status: "Status:",
      operational: "Operational",
      centralMetroAlt: "Central Metro Realty",
    },
  },
  es: {
    header: {
      navLabel: "Principal",
      pricing: "Precios",
      about: "Nosotros",
      serviceArea: "Zona de servicio",
      listings: "Propiedades",
      portfolio: "Portafolio",
      resources: "Recursos",
      university: "Universidad",
      dashboard: "Panel",
      logIn: "Iniciar sesión",
      viewListings: "Ver propiedades",
      startListing: "Publicar ahora",
      logOut: "Cerrar sesión",
    },
    footer: {
      tagline:
        "Una herramienta técnica para publicar rápido y conservar más capital en tu venta.",
      brokerSupport:
        "Soporte de correduría en Texas · despliegue rápido en 4 horas",
      product: "Producto",
      resources: "Recursos",
      legal: "Legal",
      pricing: "Precios",
      listings: "Propiedades",
      portfolio: "Portafolio",
      blogs: "Blogs",
      videos: "Videos",
      university: "Universidad ListQik",
      iabs: "Información sobre servicios de corretaje (IABS)",
      consumerProtection: "Aviso de protección al consumidor",
      mlsFines: "Calendario de multas de reglas MLS",
      mlsRules: "Reglas y regulaciones MLS",
      fairHousing: "Vivienda justa",
      privacy: "Privacidad",
      terms: "Términos",
      copyright: "Todos los derechos reservados.",
      status: "Estado:",
      operational: "Operativo",
      centralMetroAlt: "Central Metro Realty",
    },
  },
};

export function getSiteChromeCopy(locale: HomeLocale): SiteChromeCopy {
  return COPY[locale];
}
