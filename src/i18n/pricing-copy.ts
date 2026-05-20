import type { HomeLocale } from "@/i18n/home-locale";
import type { PlanId } from "@/types/pricing-wizard";

export type PricingPropertyTypeId =
  | "single-family"
  | "condo"
  | "vacant-land"
  | "townhouse-villa"
  | "multi-family"
  | "mobile-manufactured";

export type PricingPlanCopy = {
  id: PlanId;
  name: string;
  badge: string;
  price: string;
  closeFee: string;
  listTerm: string;
  photos: string;
  support: string;
  highlight?: boolean;
  included: string[];
  optional: string[];
};

export type PricingPropertyTypeCopy = {
  id: PricingPropertyTypeId;
  label: string;
  description: string;
};

export type PricingCopy = {
  languageToggle: { en: string; es: string };
  languageGroupLabel: string;
  subsonicPromoPrice: string;
  hud: { console: string; live: string };
  header: { title: string; body: string };
  gauges: { value: string; speed: string; compliance: string; rpm: string };
  planCard: {
    recommended: string;
    listingTerm: string;
    photos: string;
    support: string;
    included: string;
    selectPlan: string;
  };
  disclaimer: string;
  wizard: {
    dialogLabel: string;
    intakeLabel: string;
    close: string;
    selectedPackage: string;
    selectPlanHint: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    propertyAddress: string;
    unit: string;
    city: string;
    state: string;
    zip: string;
    county: string;
    propertyType: string;
    propertyTypePlaceholder: string;
    fullName: string;
    email: string;
    phone: string;
    termsPrefix: string;
    termsLink: string;
    termsSuffix: string;
    nextCheckout: string;
    preparingCheckout: string;
    orderSummary: string;
    planLabel: string;
    propertyLabel: string;
    stripeHostedHint: string;
    openStripeCheckout: string;
    checkoutPreparing: string;
    checkoutNotReady: string;
    back: string;
    successTitle: string;
    successBody: string;
    selectedPlan: string;
    propertyLine: string;
    addUpgrades: string;
    continueListingSetup: string;
    preparing: string;
  };
  errors: {
    paymentStatusConnection: string;
    paymentStatus: string;
    paymentPending: string;
    sessionNotFound: string;
    continueFailed: string;
    networkHandoff: string;
    checkoutInit: string;
    stripeCreate: string;
    stripeUrlMissing: string;
  };
  plans: PricingPlanCopy[];
  propertyTypes: PricingPropertyTypeCopy[];
};

const COPY: Record<HomeLocale, PricingCopy> = {
  en: {
    languageToggle: { en: "EN", es: "ES" },
    languageGroupLabel: "Language",
    subsonicPromoPrice: "$79",
    hud: { console: "LISTQIK PRICING CONSOLE", live: "TEXAS · LIVE" },
    header: {
      title: "Simple pricing to help you keep more from your sale.",
      body: "Select your speed tier, complete property intake, finish checkout, and continue to your success screen.",
    },
    gauges: { value: "VALUE", speed: "SPEED", compliance: "COMPLIANCE", rpm: "RPM" },
    planCard: {
      recommended: "Recommended",
      listingTerm: "Listing term",
      photos: "Photos",
      support: "Support",
      included: "Included",
      selectPlan: "Select",
    },
    disclaimer:
      "Brokerage-regulated services, including listing submission and compliance approval, are provided through a licensed brokerage. ListQik.com provides marketing, technology, and administrative support.",
    wizard: {
      dialogLabel: "Pricing intake wizard",
      intakeLabel: "PRICING INTAKE",
      close: "Close",
      selectedPackage: "Selected package:",
      selectPlanHint: "Select a plan above to begin property intake.",
      step1Title: "Step 1: Property & contact",
      step2Title: "Step 2: Plan checkout (Stripe)",
      step3Title: "Step 3: Success",
      propertyAddress: "Property address",
      unit: "Apt / Suite / Unit",
      city: "City",
      state: "State",
      zip: "ZIP / Postal",
      county: "County",
      propertyType: "PROPERTY TYPE",
      propertyTypePlaceholder: "Select property type…",
      fullName: "Full name",
      email: "Email",
      phone: "Phone",
      termsPrefix: "I have read and agree to the",
      termsLink: "Terms of Service",
      termsSuffix:
        "and understand brokerage intake is governed by those terms and applicable listing agreements.",
      nextCheckout: "Next: Plan Checkout",
      preparingCheckout: "Preparing checkout...",
      orderSummary: "Order summary",
      planLabel: "Plan",
      propertyLabel: "Property",
      stripeHostedHint:
        "Stripe Checkout opens in a secure hosted page. Complete payment there, then return to continue.",
      openStripeCheckout: "Open Stripe checkout",
      checkoutPreparing: "Preparing plan checkout...",
      checkoutNotReady: "Plan checkout is not ready yet. Please go back and retry.",
      back: "Back",
      successTitle: "Your plan checkout is complete.",
      successBody:
        "Next you'll acknowledge the ListQik User Agreement, then go straight into your listing setup wizard. You can also add optional marketing upgrades first.",
      selectedPlan: "Selected plan:",
      propertyLine: "Property:",
      addUpgrades: "Add upgrades",
      continueListingSetup: "Continue to listing setup",
      preparing: "Preparing...",
    },
    errors: {
      paymentStatusConnection:
        "Could not verify payment status. Check your connection and try again.",
      paymentStatus: "Could not verify payment status.",
      paymentPending: "Payment is not recorded yet. Please complete checkout and try again.",
      sessionNotFound: "Could not find your checkout session. Please refresh and try again.",
      continueFailed: "Could not continue yet. Please retry in a few seconds.",
      networkHandoff: "Network error while preparing your account handoff.",
      checkoutInit: "Could not initialize checkout session. Please retry.",
      stripeCreate: "Could not create Stripe checkout. Please try again.",
      stripeUrlMissing: "Stripe checkout URL was not generated.",
    },
    plans: [
      {
        id: "subsonic",
        name: "Subsonic",
        badge: "Basic · Essential",
        price: "$99",
        closeFee: "0.50% at closing",
        listTerm: "6 months",
        photos: "Up to 25 photos",
        support: "7-day support (chat/email/phone)",
        included: [
          "Broker-assisted listing submission target within 24 hours of complete docs",
          "Distribution to major home-search portals",
          "Required listing forms and disclosure workflow",
          "Unlimited listing edits while active",
          "Your contact details shown where listing rules allow",
          "Buyer inquiries routed to you",
          "You control buyer-agent concessions in negotiations",
          "Welcome onboarding call",
        ],
        optional: [
          "Showing scheduler module",
          "Yard sign kit",
          "Open house directional sign pack",
          "Virtual tour publishing add-on",
          "Transaction coordinator support",
          "Offer/counter prep and review",
          "Comparative market analysis (CMA)",
          "Professional photography add-on",
        ],
      },
      {
        id: "supersonic",
        name: "Supersonic",
        badge: "Premium · Most Popular",
        price: "$295",
        closeFee: "0.3% at closing",
        listTerm: "6 months",
        photos: "Max Photos",
        support: "7-day support (priority queue)",
        highlight: true,
        included: [
          "Everything in Subsonic (Basic)",
          "Lower compliance close-out fee",
          "Max-photo listing format for broader visual coverage",
          "Welcome onboarding call",
          "Showing scheduler included",
          "2 free open house announcements",
          "1 free Comparative Market Analysis (CMA)",
        ],
        optional: [
          "Yard sign kit",
          "Open house directional sign pack",
          "Virtual tour publishing add-on",
          "Transaction coordinator support",
          "Offer/counter prep and review",
          "Additional Comparative Market Analysis (CMA)",
          "Professional photography add-on",
        ],
      },
      {
        id: "hypersonic",
        name: "Hypersonic",
        badge: "Luxury · Full Service",
        price: "$595",
        closeFee: "0.25% at closing",
        listTerm: "12 months",
        photos: "Max Photos",
        support: "7-day support + enhanced setup",
        included: [
          "Everything in Supersonic (Premium)",
          "12-month listing window",
          "Showing scheduler included",
          "Yard sign kit included",
          "Directional sign pack included",
          "Open house publishing bundle included",
          "Virtual tour publishing included",
          "Transaction coordinator support included",
          "Professional photography included",
        ],
        optional: [
          "Offer/counter prep and review",
          "Comparative market analysis (CMA)",
          "Additional broker-facilitated listing territory",
        ],
      },
    ],
    propertyTypes: [
      {
        id: "single-family",
        label: "Single Family",
        description: "Detached home intended for one household.",
      },
      {
        id: "condo",
        label: "Condo",
        description: "Individually owned unit in a shared building/community.",
      },
      {
        id: "vacant-land",
        label: "Vacant Lot / Land",
        description: "Land parcel without residential structure.",
      },
      {
        id: "townhouse-villa",
        label: "Townhouse / Villa",
        description: "Attached or semi-attached home with shared walls.",
      },
      {
        id: "multi-family",
        label: "Multi-Family",
        description: "Property with multiple dwelling units.",
      },
      {
        id: "mobile-manufactured",
        label: "Mobile / Manufactured",
        description: "Factory-built residential structure.",
      },
    ],
  },
  es: {
    languageToggle: { en: "EN", es: "ES" },
    languageGroupLabel: "Idioma",
    subsonicPromoPrice: "$79",
    hud: { console: "CONSOLA DE PRECIOS LISTQIK", live: "TEXAS · EN VIVO" },
    header: {
      title: "Precios simples para que conserve más de su venta.",
      body: "Elija su nivel, complete la información de la propiedad, finalice el pago y continúe a la pantalla de éxito.",
    },
    gauges: { value: "VALOR", speed: "VELOCIDAD", compliance: "CUMPLIMIENTO", rpm: "RPM" },
    planCard: {
      recommended: "Recomendado",
      listingTerm: "Plazo de publicación",
      photos: "Fotos",
      support: "Soporte",
      included: "Incluido",
      selectPlan: "Seleccionar",
    },
    disclaimer:
      "Los servicios regulados por corretaje, incluida la presentación del listado y la aprobación de cumplimiento, se proporcionan a través de un corretaje con licencia. ListQik.com ofrece marketing, tecnología y soporte administrativo.",
    wizard: {
      dialogLabel: "Asistente de registro de precios",
      intakeLabel: "REGISTRO DE PRECIOS",
      close: "Cerrar",
      selectedPackage: "Paquete seleccionado:",
      selectPlanHint: "Seleccione un plan arriba para comenzar el registro de la propiedad.",
      step1Title: "Paso 1: Propiedad y contacto",
      step2Title: "Paso 2: Pago del plan (Stripe)",
      step3Title: "Paso 3: Éxito",
      propertyAddress: "Dirección de la propiedad",
      unit: "Apto / Suite / Unidad",
      city: "Ciudad",
      state: "Estado",
      zip: "Código postal",
      county: "Condado",
      propertyType: "TIPO DE PROPIEDAD",
      propertyTypePlaceholder: "Seleccione el tipo de propiedad…",
      fullName: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono",
      termsPrefix: "He leído y acepto los",
      termsLink: "Términos de servicio",
      termsSuffix:
        "y entiendo que el registro con el corretaje se rige por esos términos y los acuerdos de listado aplicables.",
      nextCheckout: "Siguiente: Pago del plan",
      preparingCheckout: "Preparando el pago...",
      orderSummary: "Resumen del pedido",
      planLabel: "Plan",
      propertyLabel: "Propiedad",
      stripeHostedHint:
        "Stripe Checkout se abre en una página segura. Complete el pago allí y regrese para continuar.",
      openStripeCheckout: "Abrir pago de Stripe",
      checkoutPreparing: "Preparando el pago del plan...",
      checkoutNotReady: "El pago del plan aún no está listo. Regrese e intente de nuevo.",
      back: "Atrás",
      successTitle: "El pago de su plan está completo.",
      successBody:
        "A continuación aceptará el Acuerdo de usuario de ListQik y pasará directamente al asistente de configuración de su listado. También puede agregar mejoras de marketing opcionales primero.",
      selectedPlan: "Plan seleccionado:",
      propertyLine: "Propiedad:",
      addUpgrades: "Agregar mejoras",
      continueListingSetup: "Continuar a configuración del listado",
      preparing: "Preparando...",
    },
    errors: {
      paymentStatusConnection:
        "No se pudo verificar el estado del pago. Revise su conexión e intente de nuevo.",
      paymentStatus: "No se pudo verificar el estado del pago.",
      paymentPending: "El pago aún no está registrado. Complete el pago e intente de nuevo.",
      sessionNotFound:
        "No se encontró su sesión de pago. Actualice la página e intente de nuevo.",
      continueFailed: "Aún no se puede continuar. Intente de nuevo en unos segundos.",
      networkHandoff: "Error de red al preparar la transferencia de su cuenta.",
      checkoutInit: "No se pudo iniciar la sesión de pago. Intente de nuevo.",
      stripeCreate: "No se pudo crear el pago de Stripe. Intente de nuevo.",
      stripeUrlMissing: "No se generó la URL de pago de Stripe.",
    },
    plans: [
      {
        id: "subsonic",
        name: "Subsonic",
        badge: "Básico · Esencial",
        price: "$99",
        closeFee: "0.50% al cierre",
        listTerm: "6 meses",
        photos: "Hasta 25 fotos",
        support: "Soporte 7 días (chat/correo/teléfono)",
        included: [
          "Presentación del listado con corretaje en un plazo objetivo de 24 horas tras documentación completa",
          "Distribución en los principales portales de búsqueda de vivienda",
          "Formularios de listado y flujo de divulgación requeridos",
          "Cambios ilimitados al listado mientras esté activo",
          "Sus datos de contacto donde las reglas del listado lo permitan",
          "Consultas de compradores dirigidas a usted",
          "Usted controla las concesiones al agente del comprador en las negociaciones",
          "Llamada de bienvenida e incorporación",
        ],
        optional: [
          "Módulo de programación de visitas",
          "Kit de letrero de patio",
          "Paquete de letreros direccionales para open house",
          "Complemento de publicación de tour virtual",
          "Soporte de coordinador de transacciones",
          "Preparación y revisión de ofertas/contraofertas",
          "Análisis comparativo de mercado (CMA)",
          "Complemento de fotografía profesional",
        ],
      },
      {
        id: "supersonic",
        name: "Supersonic",
        badge: "Premium · Más popular",
        price: "$295",
        closeFee: "0.3% al cierre",
        listTerm: "6 meses",
        photos: "Máximo de fotos",
        support: "Soporte 7 días (cola prioritaria)",
        highlight: true,
        included: [
          "Todo lo de Subsonic (Básico)",
          "Tarifa de cierre de cumplimiento más baja",
          "Formato de listado con máximo de fotos para mayor cobertura visual",
          "Llamada de bienvenida e incorporación",
          "Programador de visitas incluido",
          "2 anuncios de open house gratis",
          "1 análisis comparativo de mercado (CMA) gratis",
        ],
        optional: [
          "Kit de letrero de patio",
          "Paquete de letreros direccionales para open house",
          "Complemento de publicación de tour virtual",
          "Soporte de coordinador de transacciones",
          "Preparación y revisión de ofertas/contraofertas",
          "Análisis comparativo de mercado (CMA) adicional",
          "Complemento de fotografía profesional",
        ],
      },
      {
        id: "hypersonic",
        name: "Hypersonic",
        badge: "Lujo · Servicio completo",
        price: "$595",
        closeFee: "0.25% al cierre",
        listTerm: "12 meses",
        photos: "Máximo de fotos",
        support: "Soporte 7 días + configuración mejorada",
        included: [
          "Todo lo de Supersonic (Premium)",
          "Ventana de listado de 12 meses",
          "Programador de visitas incluido",
          "Kit de letrero de patio incluido",
          "Paquete de letreros direccionales incluido",
          "Paquete de publicación de open house incluido",
          "Publicación de tour virtual incluida",
          "Soporte de coordinador de transacciones incluido",
          "Fotografía profesional incluida",
        ],
        optional: [
          "Preparación y revisión de ofertas/contraofertas",
          "Análisis comparativo de mercado (CMA)",
          "Territorio de listado adicional facilitado por el corretaje",
        ],
      },
    ],
    propertyTypes: [
      {
        id: "single-family",
        label: "Casa unifamiliar",
        description: "Vivienda independiente para un hogar.",
      },
      {
        id: "condo",
        label: "Condominio",
        description: "Unidad de propiedad individual en edificio o comunidad compartida.",
      },
      {
        id: "vacant-land",
        label: "Lote / Terreno vacío",
        description: "Parcela de terreno sin estructura residencial.",
      },
      {
        id: "townhouse-villa",
        label: "Townhouse / Villa",
        description: "Vivienda adosada o semi-adosada con paredes compartidas.",
      },
      {
        id: "multi-family",
        label: "Multifamiliar",
        description: "Propiedad con varias unidades de vivienda.",
      },
      {
        id: "mobile-manufactured",
        label: "Móvil / Manufacturada",
        description: "Estructura residencial construida en fábrica.",
      },
    ],
  },
};

export function getPricingCopy(locale: HomeLocale): PricingCopy {
  return COPY[locale] ?? COPY.en;
}

export type PricingPlan = PricingPlanCopy;
