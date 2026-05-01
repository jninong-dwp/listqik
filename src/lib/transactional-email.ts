import nodemailer from "nodemailer";

type SetupEmailInput = {
  to: string;
  fullName?: string;
  setupAccountUrl: string;
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
  const subject = "Finish setting up your ListQik seller account";

  const text = [
    `Hi ${greetingName},`,
    "",
    "Thanks for your order.",
    "Use this secure link to finish setting up your account:",
    input.setupAccountUrl,
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
    "<p>Use this secure link to finish setting up your account:</p>",
    `<p><a href="${input.setupAccountUrl}">${input.setupAccountUrl}</a></p>`,
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
