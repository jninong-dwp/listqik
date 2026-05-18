import nodemailer from "nodemailer";
import { parseAdminEmails } from "@/lib/admin";
import { escapeHtmlForEmail } from "@/lib/email-notification-templates";
import {
  renderStoredEmail,
  renderStoredEmailWithInternalListingHtml,
} from "@/lib/email-template-service";

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

export type ExistingAccountNewPlanEmailInput = {
  to: string;
  fullName?: string;
  planName: string;
  propertyAddress: string;
  dashboardUrl: string;
  listingSetupCta: string;
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

type SmtpMessage = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

async function sendSmtpMessage(input: SmtpMessage): Promise<SendResult> {
  const config = smtpConfig();
  if (!config) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const to = Array.isArray(input.to) ? input.to.join(", ") : input.to;

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
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "SMTP send failed.";
    return { sent: false, error };
  }
}

export async function sendSetupAccountEmail(input: SetupEmailInput): Promise<SendResult> {
  if (!smtpConfig()) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const greetingName = input.fullName?.trim() || "there";
  const firstLoginPath = input.firstLoginPath?.trim() || "/dashboard";
  const setupUrlWithNext = `${input.setupAccountUrl}${
    input.setupAccountUrl.includes("?") ? "&" : "?"
  }next=${encodeURIComponent(firstLoginPath)}`;

  const rendered = await renderStoredEmail("setup_account", {
    greetingName,
    setupUrl: setupUrlWithNext,
  });
  return sendSmtpMessage({ to: input.to, ...rendered });
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
  return escapeHtmlForEmail(value);
}

export async function sendInternalListingFinalizedEmail(
  input: ListingFinalizedEmailInput,
): Promise<SendResult> {
  if (!smtpConfig()) {
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

  const rendered = await renderStoredEmailWithInternalListingHtml({
    address: input.address,
    listingStart: startDateLabel,
    listingEnd: endDateLabel,
    status: input.status,
    finalizedAt: finalizedLabel,
    sellerName: input.sellerName,
    sellerEmail: input.sellerEmail,
    contactPhone: input.contactPhone?.trim() ?? "",
    county: input.county?.trim() ?? "",
    planLabel: input.planLabel ?? "—",
    listPrice: priceLabel,
    buyerAgentComp: input.buyerAgentCompSummary ?? "—",
    mlsName: input.mlsName ?? "—",
    mlsNumber: input.mlsNumber ?? "—",
    platforms: platformsLabel,
    heroImage: input.heroImageUploaded ? "Uploaded" : "Not uploaded",
    additionalPhotos: String(input.additionalPhotoCount),
    documentCount: String(input.documentCount),
    adminProfileUrl: input.adminProfileUrl?.trim() ?? "",
  });

  return sendSmtpMessage({ to: recipients, ...rendered });
}

export async function sendExistingAccountAccessEmail(
  input: ExistingAccountEmailInput,
): Promise<SendResult> {
  if (!smtpConfig()) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const greetingName = input.fullName?.trim() || "there";
  const rendered = await renderStoredEmail("existing_account", {
    greetingName,
    loginUrl: input.loginUrl,
  });
  return sendSmtpMessage({ to: input.to, ...rendered });
}

export async function sendExistingAccountNewPlanEmail(
  input: ExistingAccountNewPlanEmailInput,
): Promise<SendResult> {
  if (!smtpConfig()) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const greetingName = input.fullName?.trim() || "there";
  const rendered = await renderStoredEmail("existing_account_new_plan", {
    greetingName,
    planName: input.planName.trim() || "ListQik plan",
    propertyAddress: input.propertyAddress.trim(),
    dashboardUrl: input.dashboardUrl.trim(),
    listingSetupCta: input.listingSetupCta.trim(),
  });
  return sendSmtpMessage({ to: input.to, ...rendered });
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
  if (!smtpConfig()) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const startLabel = fmtDateForEmail(input.listingStartOn);
  const endLabel = fmtDateForEmail(input.listingEndOn);
  const greetingName = input.sellerName?.trim() || "there";
  const isScheduled = input.status === "PENDING";
  const templateKey = isScheduled
    ? "seller_listing_finalized_scheduled"
    : "seller_listing_finalized_active";
  const rendered = await renderStoredEmail(templateKey, {
    greetingName,
    address: input.address,
    listingStart: startLabel,
    listingEnd: endLabel,
    dashboardUrl: input.dashboardUrl,
  });
  return sendSmtpMessage({ to: input.to, ...rendered });
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
  if (!smtpConfig()) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const email = input.purchaserEmail.trim().toLowerCase();
  if (!email) return { sent: false, error: "Purchaser email is required." };

  const labels =
    input.upgradeLabels && input.upgradeLabels.length > 0 ? input.upgradeLabels : input.upgradeSlugs;
  const summary = labels.length > 0 ? labels.join(", ") : "Upgrades";
  const amountLabel =
    typeof input.amountTotal === "number" ? fmtMoneyForEmail(input.amountTotal) : null;
  const greetingName = input.purchaserName?.trim() || "there";
  const rendered = await renderStoredEmail("upgrade_purchase_confirmation", {
    greetingName,
    upgradeSummary: summary,
    amount: amountLabel ?? "—",
    orderRef: input.orderRef?.trim() ?? "—",
    dashboardUrl: input.dashboardUrl?.trim() ?? "—",
  });
  return sendSmtpMessage({ to: email, ...rendered });
}

export async function sendInternalUpgradePurchaseEmail(
  input: UpgradePurchaseEmailInput,
): Promise<SendResult> {
  if (!smtpConfig()) {
    return { sent: false, error: "SMTP is not fully configured." };
  }

  const recipients = resolveInternalNotificationRecipients();
  if (recipients.length === 0) {
    return { sent: false, error: "No internal notification recipients configured." };
  }

  const labels =
    input.upgradeLabels && input.upgradeLabels.length > 0 ? input.upgradeLabels : input.upgradeSlugs;
  const summary = labels.length > 0 ? labels.join(", ") : "Upgrades";
  const amountLabel =
    typeof input.amountTotal === "number" ? fmtMoneyForEmail(input.amountTotal) : "—";
  const rendered = await renderStoredEmail("internal_upgrade_purchase", {
    purchaserName: input.purchaserName?.trim() ?? "—",
    purchaserEmail: input.purchaserEmail,
    upgradeSummary: summary,
    amount: amountLabel,
    orderRef: input.orderRef?.trim() ?? "—",
    dashboardUrl: input.dashboardUrl?.trim() ?? "—",
  });
  return sendSmtpMessage({ to: recipients, ...rendered });
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

  const result = await sendSmtpMessage({
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
  return result;
}
