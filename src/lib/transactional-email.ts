import nodemailer from "nodemailer";
import { parseAdminEmails } from "@/lib/admin";

type SetupEmailInput = {
  to: string;
  fullName?: string;
  setupAccountUrl: string;
  firstLoginPath?: string;
};

type ExistingAccountEmailInput = {
  to: string;
  fullName?: string;
  loginUrl: string;
};

type SendResult = {
  sent: boolean;
  error?: string;
};

export type ListingFinalizedEmailInput = {
  sellerName: string;
  sellerEmail: string;
  contactPhone?: string | null;
  listingId: string;
  userId: string;
  address: string;
  county?: string | null;
  status: string;
  planLabel?: string | null;
  price?: number | null;
  buyerAgentCompSummary?: string | null;
  listingStartOn: Date | null;
  listingEndOn: Date | null;
  setupFinalizedAt: Date;
  heroImageUploaded: boolean;
  additionalPhotoCount: number;
  documentCount: number;
  mlsName?: string | null;
  mlsNumber?: string | null;
  listingPlatforms: string[];
  adminProfileUrl?: string | null;
};

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !portRaw || !from || !user || !pass) {
    return null;
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) {
    return null;
  }

  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureEnv ? secureEnv === "true" : port === 465;

  return {
    host,
    port,
    secure,
    from,
    auth: { user, pass },
  };
}

export async function sendSetupAccountEmail(input: SetupEmailInput): Promise<SendResult> {
  const config = smtpConfig();
  if (!config) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const greetingName = input.fullName?.trim() || "there";
  const firstLoginPath = input.firstLoginPath?.trim() || "/dashboard";
  const setupUrlWithNext = `${input.setupAccountUrl}${
    input.setupAccountUrl.includes("?") ? "&" : "?"
  }next=${encodeURIComponent(firstLoginPath)}`;
  const subject = "Set your password and access your ListQik dashboard";

  const text = [
    `Hi ${greetingName},`,
    "",
    "Thanks for your order.",
    "Use this secure link to set your password and finish your first login:",
    setupUrlWithNext,
    "",
    "This link expires in 14 days.",
    "",
    "If you did not request this, you can ignore this email.",
    "",
    "— ListQik",
  ].join("\n");

  const html = [
    `<p>Hi ${greetingName},</p>`,
    "<p>Thanks for your order.</p>",
    "<p>Use this secure link to set your password and finish your first login:</p>",
    `<p><a href="${setupUrlWithNext}">${setupUrlWithNext}</a></p>`,
    "<p>After setting your password, you'll be signed in and sent directly to your dashboard.</p>",
    "<p>This link expires in 14 days.</p>",
    "<p>If you did not request this, you can ignore this email.</p>",
    "<p>&mdash; ListQik</p>",
  ].join("");

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    await transporter.sendMail({
      from: config.from,
      to: input.to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "SMTP send failed.";
    return { sent: false, error };
  }
}

/**
 * Resolve internal notification recipients. Prefers explicit
 * INTERNAL_NOTIFICATIONS_EMAIL (comma-separated) and falls back to ADMIN_EMAILS.
 */
export function resolveInternalNotificationRecipients(): string[] {
  const override = process.env.INTERNAL_NOTIFICATIONS_EMAIL?.trim();
  const list = override && override.length > 0 ? override : process.env.ADMIN_EMAILS;
  return [...parseAdminEmails(list)];
}

function fmtDateForEmail(value: Date | null | undefined): string {
  if (!value) return "Not set";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "Not set";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function fmtMoneyForEmail(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendInternalListingFinalizedEmail(
  input: ListingFinalizedEmailInput,
): Promise<SendResult> {
  const config = smtpConfig();
  if (!config) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const recipients = resolveInternalNotificationRecipients();
  if (recipients.length === 0) {
    return { sent: false, error: "No internal notification recipients configured." };
  }

  const startDateLabel = fmtDateForEmail(input.listingStartOn);
  const endDateLabel = fmtDateForEmail(input.listingEndOn);
  const finalizedLabel = input.setupFinalizedAt.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const priceLabel = fmtMoneyForEmail(input.price ?? null);
  const platformsLabel =
    input.listingPlatforms.length > 0 ? input.listingPlatforms.join(", ") : "—";

  const subject = `Listing setup complete — ${input.address} (starts ${startDateLabel})`;

  const lines = [
    `A seller just finalized their listing setup on ListQik.`,
    ``,
    `Listing period starts: ${startDateLabel}`,
    `Listing period ends:   ${endDateLabel}`,
    `Status after finalize: ${input.status}`,
    `Setup finalized at:    ${finalizedLabel}`,
    ``,
    `Seller:        ${input.sellerName} <${input.sellerEmail}>`,
    input.contactPhone ? `Contact phone: ${input.contactPhone}` : null,
    ``,
    `Property:      ${input.address}`,
    input.county ? `County:        ${input.county}` : null,
    ``,
    `Plan:          ${input.planLabel ?? "—"}`,
    `List price:    ${priceLabel}`,
    `Buyer agent:   ${input.buyerAgentCompSummary ?? "—"}`,
    ``,
    `MLS name:      ${input.mlsName ?? "—"}`,
    `MLS number:    ${input.mlsNumber ?? "—"}`,
    `Platforms:     ${platformsLabel}`,
    ``,
    `Hero image:    ${input.heroImageUploaded ? "Uploaded" : "Not uploaded"}`,
    `Additional photos: ${input.additionalPhotoCount}`,
    `Documents uploaded: ${input.documentCount}`,
    input.adminProfileUrl ? `` : null,
    input.adminProfileUrl ? `Open in admin: ${input.adminProfileUrl}` : null,
    ``,
    `— ListQik (automated notification)`,
  ].filter((line): line is string => line !== null);

  const text = lines.join("\n");

  const rows: Array<[string, string]> = [
    ["Listing period starts", startDateLabel],
    ["Listing period ends", endDateLabel],
    ["Status after finalize", input.status],
    ["Setup finalized at", finalizedLabel],
    ["Seller", `${input.sellerName} &lt;${escapeHtml(input.sellerEmail)}&gt;`],
    ...(input.contactPhone ? ([["Contact phone", input.contactPhone]] as Array<[string, string]>) : []),
    ["Property", input.address],
    ...(input.county ? ([["County", input.county]] as Array<[string, string]>) : []),
    ["Plan", input.planLabel ?? "—"],
    ["List price", priceLabel],
    ["Buyer agent comp", input.buyerAgentCompSummary ?? "—"],
    ["MLS name", input.mlsName ?? "—"],
    ["MLS number", input.mlsNumber ?? "—"],
    ["Platforms", platformsLabel],
    ["Hero image", input.heroImageUploaded ? "Uploaded" : "Not uploaded"],
    ["Additional photos", String(input.additionalPhotoCount)],
    ["Documents uploaded", String(input.documentCount)],
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${value.startsWith("&lt;") || value.includes("&lt;") ? value : escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const adminLinkHtml = input.adminProfileUrl
    ? `<p style="margin:16px 0 0 0;"><a href="${escapeHtml(input.adminProfileUrl)}" style="background:#059669;color:#ffffff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:600;">Open in admin dashboard</a></p>`
    : "";

  const html = [
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">`,
    `<h2 style="margin:0 0 4px 0;color:#059669;">Listing setup complete</h2>`,
    `<p style="margin:0 0 16px 0;color:#374151;">${escapeHtml(input.address)} — starts <strong>${escapeHtml(startDateLabel)}</strong>.</p>`,
    `<table style="border-collapse:collapse;font-size:14px;width:100%;max-width:640px;">`,
    tableRows,
    `</table>`,
    adminLinkHtml,
    `<p style="margin:24px 0 0 0;color:#6b7280;font-size:12px;">Automated notification from ListQik.</p>`,
    `</div>`,
  ].join("");

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    await transporter.sendMail({
      from: config.from,
      to: recipients.join(", "),
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "SMTP send failed.";
    return { sent: false, error };
  }
}

export async function sendExistingAccountAccessEmail(
  input: ExistingAccountEmailInput,
): Promise<SendResult> {
  const config = smtpConfig();
  if (!config) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const greetingName = input.fullName?.trim() || "there";
  const subject = "Your ListQik account is ready";

  const text = [
    `Hi ${greetingName},`,
    "",
    "Thanks for your order.",
    "We found that you already have a ListQik account with this email.",
    "Use this link to log in and continue to your dashboard:",
    input.loginUrl,
    "",
    "If you forgot your password, use the reset option on the login page.",
    "",
    "— ListQik",
  ].join("\n");

  const html = [
    `<p>Hi ${greetingName},</p>`,
    "<p>Thanks for your order.</p>",
    "<p>We found that you already have a ListQik account with this email.</p>",
    "<p>Use this link to log in and continue to your dashboard:</p>",
    `<p><a href=\"${input.loginUrl}\">${input.loginUrl}</a></p>`,
    "<p>If you forgot your password, use the reset option on the login page.</p>",
    "<p>&mdash; ListQik</p>",
  ].join("");

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    await transporter.sendMail({
      from: config.from,
      to: input.to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "SMTP send failed.";
    return { sent: false, error };
  }
}

export type SellerListingFinalizedEmailInput = {
  to: string;
  sellerName: string;
  address: string;
  status: string;
  listingStartOn: Date | null;
  listingEndOn: Date | null;
  dashboardUrl: string;
};

export async function sendSellerListingFinalizedEmail(
  input: SellerListingFinalizedEmailInput,
): Promise<SendResult> {
  const config = smtpConfig();
  if (!config) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const startLabel = fmtDateForEmail(input.listingStartOn);
  const endLabel = fmtDateForEmail(input.listingEndOn);
  const greetingName = input.sellerName?.trim() || "there";
  const isScheduled = input.status === "PENDING";
  const subject = isScheduled
    ? `Listing setup complete — goes live ${startLabel}`
    : "Your ListQik listing setup is complete";

  const text = [
    `Hi ${greetingName},`,
    "",
    isScheduled
      ? `We received your completed listing setup for ${input.address}. Your listing is scheduled to go live on ${startLabel}.`
      : `Your listing setup for ${input.address} is complete and your listing is now active in your dashboard.`,
    "",
    `Listing period: ${startLabel} through ${endLabel}`,
    "",
    "Open your dashboard:",
    input.dashboardUrl,
    "",
    "— ListQik",
  ].join("\n");

  const html = [
    `<p>Hi ${escapeHtml(greetingName)},</p>`,
    isScheduled
      ? `<p>We received your completed listing setup for <strong>${escapeHtml(input.address)}</strong>. Your listing is scheduled to go live on <strong>${escapeHtml(startLabel)}</strong>.</p>`
      : `<p>Your listing setup for <strong>${escapeHtml(input.address)}</strong> is complete. Your listing is now active in your dashboard.</p>`,
    `<p><strong>Listing period:</strong> ${escapeHtml(startLabel)} through ${escapeHtml(endLabel)}</p>`,
    `<p><a href="${escapeHtml(input.dashboardUrl)}">Open your dashboard</a></p>`,
    "<p>&mdash; ListQik</p>",
  ].join("");

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    await transporter.sendMail({ from: config.from, to: input.to, subject, text, html });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "SMTP send failed.";
    return { sent: false, error };
  }
}

export type UpgradePurchaseEmailInput = {
  purchaserEmail: string;
  purchaserName?: string | null;
  upgradeSlugs: string[];
  upgradeLabels?: string[];
  amountTotal?: number | null;
  orderRef?: string | null;
  dashboardUrl?: string | null;
};

export async function sendUpgradePurchaseConfirmationEmail(
  input: UpgradePurchaseEmailInput,
): Promise<SendResult> {
  const config = smtpConfig();
  if (!config) return { sent: false, error: "SMTP is not fully configured." };

  const email = input.purchaserEmail.trim().toLowerCase();
  if (!email) return { sent: false, error: "Purchaser email is required." };

  const labels =
    input.upgradeLabels && input.upgradeLabels.length > 0 ? input.upgradeLabels : input.upgradeSlugs;
  const summary = labels.length > 0 ? labels.join(", ") : "Upgrades";
  const amountLabel =
    typeof input.amountTotal === "number" ? fmtMoneyForEmail(input.amountTotal) : null;
  const greetingName = input.purchaserName?.trim() || "there";
  const subject = `Upgrade purchase confirmed — ${summary}`;

  const text = [
    `Hi ${greetingName},`,
    "",
    "Thank you for your purchase:",
    summary,
    amountLabel ? `Amount: ${amountLabel}` : null,
    input.orderRef ? `Order reference: ${input.orderRef}` : null,
    input.dashboardUrl ? `Dashboard: ${input.dashboardUrl}` : null,
    "",
    "— ListQik",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const html = [
    `<p>Hi ${escapeHtml(greetingName)},</p>`,
    "<p>Thank you for your upgrade purchase:</p>",
    `<p><strong>${escapeHtml(summary)}</strong></p>`,
    amountLabel ? `<p>Amount: ${escapeHtml(amountLabel)}</p>` : "",
    input.orderRef ? `<p>Order reference: ${escapeHtml(input.orderRef)}</p>` : "",
    input.dashboardUrl ? `<p><a href="${escapeHtml(input.dashboardUrl)}">Open your dashboard</a></p>` : "",
    "<p>&mdash; ListQik</p>",
  ].join("");

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    await transporter.sendMail({ from: config.from, to: email, subject, text, html });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "SMTP send failed.";
    return { sent: false, error };
  }
}

export async function sendInternalUpgradePurchaseEmail(
  input: UpgradePurchaseEmailInput,
): Promise<SendResult> {
  const config = smtpConfig();
  if (!config) return { sent: false, error: "SMTP is not fully configured." };

  const recipients = resolveInternalNotificationRecipients();
  if (recipients.length === 0) {
    return { sent: false, error: "No internal notification recipients configured." };
  }

  const labels =
    input.upgradeLabels && input.upgradeLabels.length > 0 ? input.upgradeLabels : input.upgradeSlugs;
  const summary = labels.length > 0 ? labels.join(", ") : "Upgrades";
  const amountLabel =
    typeof input.amountTotal === "number" ? fmtMoneyForEmail(input.amountTotal) : "—";
  const subject = `Upgrade purchase — ${input.purchaserEmail} (${summary})`;

  const text = [
    "Upgrade purchase on ListQik.",
    `Buyer: ${input.purchaserName ?? "—"} <${input.purchaserEmail}>`,
    `Upgrades: ${summary}`,
    `Amount: ${amountLabel}`,
    input.orderRef ? `Order reference: ${input.orderRef}` : null,
    input.dashboardUrl ? `Dashboard: ${input.dashboardUrl}` : null,
    "",
    "— ListQik (automated notification)",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const html = [
    "<p>Upgrade purchase on ListQik.</p>",
    `<p><strong>Buyer:</strong> ${escapeHtml(input.purchaserName ?? "—")} &lt;${escapeHtml(input.purchaserEmail)}&gt;</p>`,
    `<p><strong>Upgrades:</strong> ${escapeHtml(summary)}</p>`,
    `<p><strong>Amount:</strong> ${escapeHtml(amountLabel)}</p>`,
    input.orderRef ? `<p><strong>Order reference:</strong> ${escapeHtml(input.orderRef)}</p>` : "",
    input.dashboardUrl ? `<p><a href="${escapeHtml(input.dashboardUrl)}">Open dashboard</a></p>` : "",
    "<p style='color:#6b7280;font-size:12px;'>Automated notification from ListQik.</p>",
  ].join("");

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    await transporter.sendMail({ from: config.from, to: recipients.join(", "), subject, text, html });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "SMTP send failed.";
    return { sent: false, error };
  }
}

export type SmtpMailerStatus = {
  configured: boolean;
  from: string | null;
  host: string | null;
};

export function getSmtpMailerStatus(): SmtpMailerStatus {
  const config = smtpConfig();
  if (!config) {
    return { configured: false, from: null, host: null };
  }
  return {
    configured: true,
    from: config.from,
    host: config.host,
  };
}

export type TestEmailInput = {
  to: string;
  subject?: string;
  body: string;
};

export async function sendTestEmail(input: TestEmailInput): Promise<SendResult> {
  const config = smtpConfig();
  if (!config) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const to = input.to.trim().toLowerCase();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { sent: false, error: "A valid recipient email is required." };
  }

  const body = input.body.trim();
  if (!body) {
    return { sent: false, error: "Message body is required." };
  }

  const subject = (input.subject?.trim() || "ListQik test email").slice(0, 200);
  const text = body;
  const htmlBody = body
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line) || "&nbsp;"}</p>`)
    .join("");

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
      html: [
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">`,
        `<p style="margin:0 0 12px 0;color:#6b7280;font-size:12px;">Test message from ListQik admin</p>`,
        htmlBody,
        `<p style="margin:16px 0 0 0;color:#6b7280;font-size:12px;">Sent via SMTP (${escapeHtml(config.host)})</p>`,
        `</div>`,
      ].join(""),
    });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "SMTP send failed.";
    return { sent: false, error };
  }
}
