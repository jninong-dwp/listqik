import { NextResponse } from "next/server";

import { loadWizardUpgrades } from "@/lib/ghl-products";

/**
 * Server-only: loads upgrade rows from GHL Payments products when token + location are configured.
 * See README for `GHL_PRIVATE_INTEGRATION_TOKEN`, `GHL_LOCATION_ID`, optional product maps.
 */
export async function GET() {
  const { source, upgrades, warning } = await loadWizardUpgrades();
  return NextResponse.json({ ok: true, source, upgrades, warning: warning ?? null });
}
