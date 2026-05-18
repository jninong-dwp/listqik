import { connectDb } from "@/lib/mongodb";
import {
  EMAIL_TEMPLATE_DEFINITIONS,
  EMAIL_TEMPLATE_KEYS,
  type EmailTemplateKey,
  escapeHtmlForEmail,
  isEmailTemplateKey,
  renderEmailFromTemplate,
  renderTemplateString,
} from "@/lib/email-notification-templates";
import { EmailNotificationTemplate } from "@/models/EmailNotificationTemplate";

export type ResolvedEmailTemplate = {
  key: EmailTemplateKey;
  label: string;
  description: string;
  variables: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
  isCustom: boolean;
  updatedAt: string | null;
};

export async function getResolvedEmailTemplate(key: EmailTemplateKey): Promise<ResolvedEmailTemplate> {
  await connectDb();
  const def = EMAIL_TEMPLATE_DEFINITIONS[key];
  const doc = await EmailNotificationTemplate.findOne({ key }).lean();

  if (!doc) {
    return {
      key,
      label: def.label,
      description: def.description,
      variables: def.variables,
      subject: def.subject,
      textBody: def.textBody,
      htmlBody: def.htmlBody,
      isCustom: false,
      updatedAt: null,
    };
  }

  return {
    key,
    label: def.label,
    description: def.description,
    variables: def.variables,
    subject: doc.subject,
    textBody: doc.textBody,
    htmlBody: doc.htmlBody ?? "",
    isCustom: true,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function listResolvedEmailTemplates(): Promise<ResolvedEmailTemplate[]> {
  return Promise.all(EMAIL_TEMPLATE_KEYS.map((key) => getResolvedEmailTemplate(key)));
}

export async function saveEmailTemplateOverride(input: {
  key: EmailTemplateKey;
  subject: string;
  textBody: string;
  htmlBody: string;
  updatedByEmail?: string | null;
}): Promise<ResolvedEmailTemplate> {
  const subject = input.subject.trim();
  const textBody = input.textBody.trim();
  if (!subject) throw new Error("Subject is required.");
  if (!textBody) throw new Error("Plain-text body is required.");

  await connectDb();
  await EmailNotificationTemplate.findOneAndUpdate(
    { key: input.key },
    {
      key: input.key,
      subject,
      textBody,
      htmlBody: input.htmlBody.trim(),
      updatedByEmail: input.updatedByEmail?.trim().toLowerCase() || undefined,
    },
    { upsert: true, new: true },
  );

  return getResolvedEmailTemplate(input.key);
}

export async function resetEmailTemplateToDefault(key: EmailTemplateKey): Promise<ResolvedEmailTemplate> {
  await connectDb();
  await EmailNotificationTemplate.deleteOne({ key });
  return getResolvedEmailTemplate(key);
}

export async function renderStoredEmail(
  key: EmailTemplateKey,
  vars: Record<string, string>,
): Promise<{ subject: string; text: string; html: string }> {
  const template = await getResolvedEmailTemplate(key);
  return renderEmailFromTemplate(template.subject, template.textBody, template.htmlBody, vars);
}

export function buildInternalListingFinalizedHtml(vars: Record<string, string>): string {
  const rows: Array<[string, string]> = [
    ["Listing period starts", vars.listingStart ?? ""],
    ["Listing period ends", vars.listingEnd ?? ""],
    ["Status after finalize", vars.status ?? ""],
    ["Setup finalized at", vars.finalizedAt ?? ""],
    [
      "Seller",
      `${escapeHtmlForEmail(vars.sellerName ?? "")} &lt;${escapeHtmlForEmail(vars.sellerEmail ?? "")}&gt;`,
    ],
    ...(vars.contactPhone?.trim()
      ? ([["Contact phone", vars.contactPhone]] as Array<[string, string]>)
      : []),
    ["Property", vars.address ?? ""],
    ...(vars.county?.trim() ? ([["County", vars.county]] as Array<[string, string]>) : []),
    ["Plan", vars.planLabel ?? "—"],
    ["List price", vars.listPrice ?? "—"],
    ["Buyer agent comp", vars.buyerAgentComp ?? "—"],
    ["MLS name", vars.mlsName ?? "—"],
    ["MLS number", vars.mlsNumber ?? "—"],
    ["Platforms", vars.platforms ?? "—"],
    ["Hero image", vars.heroImage ?? ""],
    ["Additional photos", vars.additionalPhotos ?? ""],
    ["Documents uploaded", vars.documentCount ?? ""],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;white-space:nowrap;">${escapeHtmlForEmail(label)}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${value.startsWith("&lt;") || value.includes("&lt;") ? value : escapeHtmlForEmail(value)}</td></tr>`,
    )
    .join("");

  const adminUrl = vars.adminProfileUrl?.trim();
  const adminLinkHtml = adminUrl
    ? `<p style="margin:16px 0 0 0;"><a href="${escapeHtmlForEmail(adminUrl)}" style="background:#059669;color:#ffffff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:600;">Open in admin dashboard</a></p>`
    : "";

  const address = escapeHtmlForEmail(vars.address ?? "");
  const listingStart = escapeHtmlForEmail(vars.listingStart ?? "");

  return [
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">`,
    `<h2 style="margin:0 0 4px 0;color:#059669;">Listing setup complete</h2>`,
    `<p style="margin:0 0 16px 0;color:#374151;">${address} — starts <strong>${listingStart}</strong>.</p>`,
    `<table style="border-collapse:collapse;font-size:14px;width:100%;max-width:640px;">`,
    tableRows,
    `</table>`,
    adminLinkHtml,
    `<p style="margin:24px 0 0 0;color:#6b7280;font-size:12px;">Automated notification from ListQik.</p>`,
    `</div>`,
  ].join("");
}

export async function renderStoredEmailWithInternalListingHtml(
  vars: Record<string, string>,
): Promise<{ subject: string; text: string; html: string }> {
  const template = await getResolvedEmailTemplate("internal_listing_finalized");
  const rendered = renderEmailFromTemplate(template.subject, template.textBody, template.htmlBody, vars);
  if (!template.htmlBody.trim()) {
    rendered.html = buildInternalListingFinalizedHtml(vars);
  }
  return rendered;
}

export function validateTemplatePayload(body: unknown): {
  key: EmailTemplateKey;
  subject: string;
  textBody: string;
  htmlBody: string;
} {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body.");
  }
  const record = body as Record<string, unknown>;
  const key = typeof record.key === "string" ? record.key.trim() : "";
  if (!isEmailTemplateKey(key)) {
    throw new Error("Unknown template key.");
  }
  return {
    key,
    subject: typeof record.subject === "string" ? record.subject : "",
    textBody: typeof record.textBody === "string" ? record.textBody : "",
    htmlBody: typeof record.htmlBody === "string" ? record.htmlBody : "",
  };
}

export function previewTemplate(
  subject: string,
  textBody: string,
  htmlBody: string,
  vars: Record<string, string>,
): { subject: string; text: string; html: string } {
  return renderEmailFromTemplate(subject, textBody, htmlBody, vars);
}

export function defaultTemplateVars(key: EmailTemplateKey): Record<string, string> {
  const samples: Record<string, string> = {
    greetingName: "Alex",
    setupUrl: "https://listqik.com/setup-account?token=example",
    loginUrl: "https://listqik.com/login",
    planName: "Supersonic",
    propertyAddress: "123 Main St · Austin, TX 78701",
    listingSetupCta: "Go straight to your new listing setup:\nhttps://listqik.com/dashboard/listings/example/setup",
    address: "123 Main St, Austin, TX 78701",
    listingStart: "Mon, Jun 1, 2026",
    listingEnd: "Mon, Dec 1, 2026",
    dashboardUrl: "https://listqik.com/dashboard",
    status: "ACTIVE",
    finalizedAt: "May 15, 2026, 2:30 PM CDT",
    sellerName: "Alex Seller",
    sellerEmail: "seller@example.com",
    contactPhone: "(512) 555-0100",
    county: "Travis",
    planLabel: "Supersonic",
    listPrice: "$425,000",
    buyerAgentComp: "3%",
    mlsName: "ACTRIS",
    mlsNumber: "1234567",
    platforms: "Zillow, Realtor.com",
    heroImage: "Uploaded",
    additionalPhotos: "12",
    documentCount: "5",
    adminProfileUrl: "https://listqik.com/dashboard/admin/users/example",
    upgradeSummary: "Premium photography",
    amount: "$199.00",
    orderRef: "ord_example123",
    purchaserName: "Alex Seller",
    purchaserEmail: "seller@example.com",
  };
  const def = EMAIL_TEMPLATE_DEFINITIONS[key];
  const vars: Record<string, string> = {};
  for (const name of def.variables) {
    vars[name] = samples[name] ?? "";
  }
  return vars;
}

export { renderTemplateString };
