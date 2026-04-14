This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## GoHighLevel (GHL) lead capture

Lead capture submissions are sent to GoHighLevel via a server-side forwarder endpoint.

- **Endpoint**: `POST /api/ghl/lead`
- **Env var**: `GHL_LEAD_WEBHOOK_URL`

Create an `.env.local` file:

```bash
GHL_LEAD_WEBHOOK_URL="https://hooks.leadconnectorhq.com/..."
```

### Pricing wizard → GHL + checkout

- **Endpoint**: `POST /api/ghl/pricing/checkout`
- **Optional webhook**: `GHL_PRICING_WEBHOOK_URL` (receive plan/contact/property/upgrades payload)
- **Checkout URL base**: `GHL_STORE_CHECKOUT_BASE_URL`

Example:

```bash
GHL_PRICING_WEBHOOK_URL="https://hooks.leadconnectorhq.com/..."
GHL_STORE_CHECKOUT_BASE_URL="https://your-subdomain.myghl.com/v2/checkout/..."
```

### GHL API — load store products (pricing upgrades)

The pricing wizard loads add-ons from **GHL Payments / Products** via the official API (no webhook required for the product list). Create a **Private Integration** in GHL (Settings → Private Integrations), enable **Products** / **Payments** scopes as needed, then set:

```bash
# Sub-account Private Integration token (server-only — never NEXT_PUBLIC)
GHL_PRIVATE_INTEGRATION_TOKEN="pit-..."
# Location ID for that sub-account (same place as in GHL URL / settings)
GHL_LOCATION_ID="xxxxxxxxxxxxxxxx"
# Optional; default is 2021-07-28
# GHL_API_VERSION="2021-07-28"
```

**How upgrades are chosen**

1. **Recommended:** `GHL_UPGRADE_PRODUCT_IDS` — JSON map from our stable slug → GHL product `_id` (copy IDs from Payments → Products):

   ```json
   {"pro-photography":"<productId>","yard-sign":"<productId>"}
   ```

2. **Or** omit the map: the app lists products with `includedInStore: true`. Optionally restrict with comma-separated IDs:

   ```bash
   GHL_UPGRADE_PRODUCT_IDS_LIST="id1,id2,id3"
   ```

**Endpoint used by the UI:** `GET /api/ghl/pricing/upgrades` (returns merged names, prices from GHL, or a static fallback if env is missing).

## SEO configuration

Set your production site URL so canonical tags, robots, and sitemap URLs are generated correctly:

```bash
NEXT_PUBLIC_SITE_URL="https://listqik.com"
```

## Pricing wizard — address autocomplete (optional)

For Google Places suggestions on the property address field, add a browser key with **Maps JavaScript API** and **Places API** enabled, and restrict it by HTTP referrer to your domain.

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key"
```

Without this variable, the field still works as a normal address input (with `autocomplete="street-address"`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
