import type { HomeLocale } from "@/i18n/home-locale";
import { startNowSubsonicPricingHref } from "@/lib/stripe-subsonic-landing-promo";

export type StartNowPlanId =
  | "subsonic"
  | "supersonic"
  | "hypersonic"
  | "full-service";

export type StartNowPlanCopy = {
  id: StartNowPlanId;
  badge: string;
  badgeDark: boolean;
  name: string;
  copy: string;
  price: string;
  priceWas: string | null;
  sub: string;
  cta: string;
  primary: boolean;
  mailto?: boolean;
  /** When set, plan CTA uses this href instead of /pricing */
  checkoutHref?: string;
  features: string[];
};

export type StartNowCopy = {
  languageToggle: { en: string; es: string };
  languageGroupLabel: string;
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    statsLabel: string;
    statResponse: string;
    statSatisfaction: string;
    statReach: string;
    statSavings: string;
  };
  avatar: {
    label: string;
    kicker: string;
    unmute: string;
    mute: string;
  };
  pricing: {
    kicker: string;
    title: string;
    body: string;
    highlight: string;
  };
  plans: StartNowPlanCopy[];
  sellerCta: {
    title: string;
    body: string;
    cta: string;
  };
  offer: {
    closeLabel: string;
    kicker: string;
    title: string;
    body: string;
    coupon: string;
    cta: string;
    floating: string;
  };
  videoSrc: string;
};

const AVATAR_VIDEO_EN =
  "https://res.cloudinary.com/dowcybzve/video/upload/v1776868318/avatar_2_ekxnl4.mp4";

const AVATAR_VIDEO_ES =
  "https://res.cloudinary.com/dowcybzve/video/upload/v1776948978/LISTQIK_Inro_-_V2_ESP_Ver_2_jzrl95.mp4";

const COPY: Record<HomeLocale, StartNowCopy> = {
  en: {
    languageToggle: { en: "EN", es: "ES" },
    languageGroupLabel: "Language",
    hero: {
      eyebrow: "Modern real estate platform",
      title: "List smarter. Sell faster. Close with confidence.",
      body: "Premium property presentation, exposure to serious buyers, and local experts who move fast when timing matters.",
      ctaPrimary: "Start your listing",
      ctaSecondary: "Compare packages",
      statsLabel: "Key metrics",
      statResponse: "average response time",
      statSatisfaction: "customer satisfaction",
      statReach:
        "One Entry, Infinite Reach: Instantly publish to 750+ real estate websites including your local MLS, Zillow & Trulia, Realtor.com, Redfin and Homes.com",
      statSavings: "Sellers save an average of $9,000 in commissions",
    },
    avatar: {
      label: "AI assistant preview",
      kicker: "Sarah Bennet",
      unmute: "Click to unmute video",
      mute: "Click to mute video",
    },
    pricing: {
      kicker: "Pricing plans",
      title: "Choose how you want to sell",
      body: "No hidden fees or long contracts, just the tools and real estate support you need to keep more profit.",
      highlight:
        "Homeowners save an average of $11,785 compared to traditional listing routes.",
    },
    plans: [
      {
        id: "subsonic",
        badge: "Most popular",
        badgeDark: false,
        name: "Subsonic",
        copy: "Everything you need to list on MLS and sell on your terms.",
        price: "$79",
        priceWas: "$99",
        sub: "0.50% at closing",
        cta: "Get Subsonic — $79",
        primary: true,
        checkoutHref: startNowSubsonicPricingHref(),
        features: [
          "Listed on MLS and major portals",
          "Support with all required documentation",
          "Unlimited listing changes",
          "Showing and inquiry forwarding",
        ],
      },
      {
        id: "supersonic",
        badge: "Growth package",
        badgeDark: true,
        name: "Supersonic",
        copy: "Stand out with premium content and stronger listing visibility.",
        price: "$295",
        priceWas: null,
        sub: "0.3% at closing",
        cta: "Get Supersonic",
        primary: false,
        features: [
          "Everything included in Subsonic",
          "Professional photography add-on available",
          "Priority listing optimization",
          "Expanded social ad reach",
        ],
      },
      {
        id: "hypersonic",
        badge: "Performance package",
        badgeDark: true,
        name: "Hypersonic",
        copy: "Maximum exposure for high-urgency, high-impact listings.",
        price: "$595",
        priceWas: null,
        sub: "0.25% at closing",
        cta: "Get Hypersonic",
        primary: false,
        features: [
          "Everything included in Supersonic",
          "Premium ranking boost",
          "Priority seller support workflow",
          "Expanded campaign distribution",
        ],
      },
      {
        id: "full-service",
        badge: "Best value",
        badgeDark: true,
        name: "Full Service",
        copy: "Licensed agent support from listing through negotiation and closing.",
        price: "1%",
        priceWas: null,
        sub: "At closing + $199 fee",
        cta: "Talk to an agent",
        primary: false,
        mailto: true,
        features: [
          "Dedicated licensed agent",
          "Offer review and negotiation support",
          "Buyer screening and qualification",
          "Pricing strategy to maximize sale value",
        ],
      },
    ],
    sellerCta: {
      title: "Ready to list with confidence?",
      body: "Choose your package and launch a listing strategy that attracts high-intent buyers.",
      cta: "List now — $79",
    },
    offer: {
      closeLabel: "Close offer popup",
      kicker: "Limited-time offer",
      title: "Subsonic for $79 — save $20 today",
      body: "Lock in the Subsonic plan at $79 (regularly $99). Your $20 discount is applied automatically at checkout.",
      coupon: "No code needed — discount applies when you continue from this page.",
      cta: "Get Subsonic for $79",
      floating: "Claim offer",
    },
    videoSrc: AVATAR_VIDEO_EN,
  },
  es: {
    languageToggle: { en: "EN", es: "ES" },
    languageGroupLabel: "Idioma",
    hero: {
      eyebrow: "Plataforma inmobiliaria moderna",
      title: "Publica con inteligencia. Vende más rápido. Cierra con confianza.",
      body: "Presentación premium de tu propiedad, exposición para compradores serios y expertos locales que se mueven rápido cuando el tiempo importa.",
      ctaPrimary: "Comienza tu publicación",
      ctaSecondary: "Compara paquetes",
      statsLabel: "Indicadores destacados",
      statResponse: "de respuesta promedio",
      statSatisfaction: "de satisfacción de clientes",
      statReach:
        "Una sola entrada, alcance infinito: publica al instante en más de 750 sitios inmobiliarios, incluyendo tu MLS local, Zillow y Trulia, Realtor.com, Redfin y Homes.com",
      statSavings: "Los vendedores ahorran un promedio de $9,000 en comisiones",
    },
    avatar: {
      label: "Vista previa del asistente IA",
      kicker: "Asistente IA para publicaciones",
      unmute: "Toca para activar sonido del video",
      mute: "Toca para silenciar el video",
    },
    pricing: {
      kicker: "Planes de precios",
      title: "Elige cómo quieres vender",
      body: "Sin cargos ocultos ni contratos largos, solo las herramientas y el respaldo inmobiliario que necesitas para conservar más ganancia.",
      highlight:
        "Los propietarios ahorran en promedio $11,785 frente a las rutas tradicionales de publicación.",
    },
    plans: [
      {
        id: "subsonic",
        badge: "Más popular",
        badgeDark: false,
        name: "Subsonic",
        copy: "Todo lo que necesitas para publicar en MLS y vender en tus términos.",
        price: "$79",
        priceWas: "$99",
        sub: "0.50% al cierre",
        cta: "Obtener Subsonic — $79",
        primary: true,
        checkoutHref: startNowSubsonicPricingHref(),
        features: [
          "Publicado en MLS y en portales principales",
          "Soporte con toda la documentación requerida",
          "Cambios ilimitados en la publicación",
          "Reenvío de visitas y consultas",
        ],
      },
      {
        id: "supersonic",
        badge: "Paquete crecimiento",
        badgeDark: true,
        name: "Supersonic",
        copy: "Destaca con contenido premium y mayor visibilidad de tu publicación.",
        price: "$295",
        priceWas: null,
        sub: "0.3% al cierre",
        cta: "Obtener Supersonic",
        primary: false,
        features: [
          "Todo lo incluido en Subsonic",
          "Complemento de fotografía profesional disponible",
          "Optimización prioritaria de la publicación",
          "Mayor alcance en anuncios sociales",
        ],
      },
      {
        id: "hypersonic",
        badge: "Paquete rendimiento",
        badgeDark: true,
        name: "Hypersonic",
        copy: "Máxima exposición para publicaciones de alta urgencia y alto impacto.",
        price: "$595",
        priceWas: null,
        sub: "0.25% al cierre",
        cta: "Obtener Hypersonic",
        primary: false,
        features: [
          "Todo lo incluido en Supersonic",
          "Impulso premium de posicionamiento",
          "Flujo de soporte prioritario para vendedores",
          "Distribución ampliada de campañas",
        ],
      },
      {
        id: "full-service",
        badge: "Mejor valor",
        badgeDark: true,
        name: "Full Service",
        copy: "Soporte de agente licenciado desde la publicación hasta la negociación y el cierre.",
        price: "1%",
        priceWas: null,
        sub: "Tarifa de $199 + 1% al cierre",
        cta: "Habla con un agente",
        primary: false,
        mailto: true,
        features: [
          "Agente licenciado dedicado",
          "Revisión de ofertas y ayuda en negociación",
          "Filtro y calificación de compradores",
          "Estrategia de precio para maximizar el valor de venta",
        ],
      },
    ],
    sellerCta: {
      title: "¿Listo para publicar con confianza?",
      body: "Elige tu paquete y lanza una estrategia de publicación que atraiga compradores con alta intención.",
      cta: "Publica ahora — $79",
    },
    offer: {
      closeLabel: "Cerrar ventana de oferta",
      kicker: "Oferta por tiempo limitado",
      title: "Subsonic por $79 — ahorra $20 hoy",
      body: "Asegura el plan Subsonic por $79 (precio regular $99). Tu descuento de $20 se aplica automáticamente al pagar.",
      coupon: "Sin código — el descuento se aplica al continuar desde esta página.",
      cta: "Obtener Subsonic por $79",
      floating: "Reclamar oferta",
    },
    videoSrc: AVATAR_VIDEO_ES,
  },
};

export function getStartNowCopy(locale: HomeLocale): StartNowCopy {
  return COPY[locale];
}

export function fullServiceMailto(locale: HomeLocale): string {
  const subject =
    locale === "es"
      ? "Listado Full Service"
      : "Full Service listing";
  return `mailto:concierge@listqik.com?subject=${encodeURIComponent(subject)}`;
}
