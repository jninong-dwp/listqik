import nodemailer from "nodemailer";

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
