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
