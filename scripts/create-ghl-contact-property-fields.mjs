/**
 * Creates ListQik pricing intake contact custom fields in GoHighLevel (location scope).
 *
 * Requires in .env.local (or env):
 *   GHL_PRIVATE_INTEGRATION_TOKEN — sub-account token with locations/customFields.write + readonly
 *   GHL_LOCATION_ID
 *
 * Run: node scripts/create-ghl-contact-property-fields.mjs
 *
 * After creation, use the workflow merge-tag picker for each field — tags vary by GHL UI version.
 * Names use listqik_* prefix to avoid colliding with generic fields like property_address.
 * API fieldKey shape: contact.listqik_property_address (example).
 *
 * Example webhook property payload merge paths (adjust via GHL tag picker):
 *   "{{contact.custom.listqik_property_address}}" … etc.
 */
import fs from "fs";
import path from "path";

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnvLocal();

const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim();
const locationId = process.env.GHL_LOCATION_ID?.trim();
const apiVersion = process.env.GHL_API_VERSION?.trim() || "2021-07-28";

if (!token || !locationId) {
  console.error("Missing GHL_PRIVATE_INTEGRATION_TOKEN or GHL_LOCATION_ID");
  process.exit(1);
}

const BASE = "https://services.leadconnectorhq.com";

/** Field `name` becomes API fieldKey `contact.{name}` (lowercase, no spaces). */
const FIELDS = [
  { name: "listqik_property_address", placeholder: "ListQik — street address (pricing intake)" },
  { name: "listqik_property_unit", placeholder: "ListQik — apt / suite / unit" },
  { name: "listqik_property_city", placeholder: "ListQik — city" },
  { name: "listqik_property_state", placeholder: "ListQik — state" },
  { name: "listqik_property_zip", placeholder: "ListQik — ZIP / postal" },
  { name: "listqik_property_county", placeholder: "ListQik — county" },
  { name: "listqik_property_type", placeholder: "ListQik — e.g. single-family, condo" },
  {
    name: "listqik_checkout_session_id",
    placeholder: "ListQik — checkout session UUID (optional webhook correlation)",
  },
];

async function ghlFetch(method, pathname, body) {
  const url = `${BASE}${pathname}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Version: apiVersion,
    Accept: "application/json",
  };
  if (body != null) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { _raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

const listRes = await ghlFetch(
  "GET",
  `/locations/${encodeURIComponent(locationId)}/customFields?model=contact`,
  null,
);

if (!listRes.ok) {
  console.error("Failed to list custom fields:", listRes.status, listRes.json);
  if (listRes.status === 401) {
    console.error(
      "\nPrivate Integration Token needs scopes: locations/customFields.readonly + locations/customFields.write.",
    );
  }
  process.exit(1);
}

const existing = listRes.json?.customFields ?? [];
const existingKeys = new Set(
  existing.map((f) => (f.fieldKey || "").toLowerCase()),
);

console.log(`Location ${locationId}: ${existing.length} existing contact custom fields.`);

for (const field of FIELDS) {
  const expectedKey = `contact.${field.name}`.toLowerCase();
  if (existingKeys.has(expectedKey)) {
    console.log(`Skip (exists): ${field.name} → ${expectedKey}`);
    continue;
  }

  const createRes = await ghlFetch(
    "POST",
    `/locations/${encodeURIComponent(locationId)}/customFields`,
    {
      name: field.name,
      dataType: "TEXT",
      model: "contact",
      placeholder: field.placeholder,
      position: 0,
    },
  );

  if (!createRes.ok) {
    console.error(`Failed to create ${field.name}:`, createRes.status, createRes.json);
    continue;
  }

  const cf = createRes.json?.customField ?? createRes.json;
  console.log(`Created: ${field.name}`, cf?.fieldKey ? `(${cf.fieldKey})` : "");
}

console.log("\nDone. In GHL workflows, insert merge tags via the tag picker for these fields.");
console.log("If {{contact.custom.*}} does not resolve, use the tag offered by GHL for each field.");
