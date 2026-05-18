export const EMAIL_TEMPLATE_KEYS = [
  "setup_account",
  "existing_account",
  "existing_account_new_plan",
  "seller_listing_finalized_active",
  "seller_listing_finalized_scheduled",
  "internal_listing_finalized",
  "upgrade_purchase_confirmation",
  "internal_upgrade_purchase",
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export type EmailTemplateDefinition = {
  key: EmailTemplateKey;
  label: string;
  description: string;
  variables: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
};

export const EMAIL_TEMPLATE_DEFINITIONS: Record<EmailTemplateKey, EmailTemplateDefinition> = {
  setup_account: {
    key: "setup_account",
    label: "New account — set password",
    description: "Sent after checkout when a new ListQik account is created.",
    variables: ["greetingName", "setupUrl"],
    subject: "Set your password and access your ListQik dashboard",
    textBody: `Hi {{greetingName}},

Thanks for your order.
Use this secure link to set your password and finish your first login:
{{setupUrl}}

This link expires in 14 days.

If you did not request this, you can ignore this email.

— ListQik`,
    htmlBody: `<p>Hi {{greetingName}},</p>
<p>Thanks for your order.</p>
<p>Use this secure link to set your password and finish your first login:</p>
<p><a href="{{setupUrl}}">{{setupUrl}}</a></p>
<p>After setting your password, you'll be signed in and sent directly to your dashboard.</p>
<p>This link expires in 14 days.</p>
<p>If you did not request this, you can ignore this email.</p>
<p>&mdash; ListQik</p>`,
  },
  existing_account: {
    key: "existing_account",
    label: "Existing account — log in (fallback)",
    description:
      "Fallback when an existing buyer checks out but new-plan details are unavailable. Prefer existing_account_new_plan for repeat plan purchases.",
    variables: ["greetingName", "loginUrl"],
    subject: "Your ListQik account is ready",
    textBody: `Hi {{greetingName}},

Thanks for your order.
We found that you already have a ListQik account with this email.
Use this link to log in and continue to your dashboard:
{{loginUrl}}

If you forgot your password, use the reset option on the login page.

— ListQik`,
    htmlBody: `<p>Hi {{greetingName}},</p>
<p>Thanks for your order.</p>
<p>We found that you already have a ListQik account with this email.</p>
<p>Use this link to log in and continue to your dashboard:</p>
<p><a href="{{loginUrl}}">{{loginUrl}}</a></p>
<p>If you forgot your password, use the reset option on the login page.</p>
<p>&mdash; ListQik</p>`,
  },
  existing_account_new_plan: {
    key: "existing_account_new_plan",
    label: "Existing account — new plan / listing",
    description:
      "Sent when a returning customer buys another plan (typically for a different property). Points them to the dashboard and their new listing.",
    variables: ["greetingName", "planName", "propertyAddress", "dashboardUrl", "listingSetupCta"],
    subject: "Your new {{planName}} listing is ready to set up",
    textBody: `Hi {{greetingName}},

Thanks for your order. You purchased the {{planName}} plan for a new listing on ListQik.

Property:
{{propertyAddress}}

Sign in to your dashboard:
{{dashboardUrl}}

{{listingSetupCta}}

If you did not make this purchase, contact us right away.

— ListQik`,
    htmlBody: `<p>Hi {{greetingName}},</p>
<p>Thanks for your order. You purchased the <strong>{{planName}}</strong> plan for a <strong>new listing</strong> on ListQik.</p>
<p><strong>Property:</strong><br>{{propertyAddress}}</p>
<p><a href="{{dashboardUrl}}">Sign in to your dashboard</a></p>
<p style="white-space:pre-line">{{listingSetupCta}}</p>
<p>If you did not make this purchase, contact us right away.</p>
<p>&mdash; ListQik</p>`,
  },
  seller_listing_finalized_active: {
    key: "seller_listing_finalized_active",
    label: "Seller — listing setup complete (active)",
    description: "Sent to the seller when setup is finalized and the listing is active.",
    variables: ["greetingName", "address", "listingStart", "listingEnd", "dashboardUrl"],
    subject: "Your ListQik listing setup is complete",
    textBody: `Hi {{greetingName}},

Your listing setup for {{address}} is complete and your listing is now active in your dashboard.

Listing period: {{listingStart}} through {{listingEnd}}

Open your dashboard:
{{dashboardUrl}}

— ListQik`,
    htmlBody: `<p>Hi {{greetingName}},</p>
<p>Your listing setup for <strong>{{address}}</strong> is complete. Your listing is now active in your dashboard.</p>
<p><strong>Listing period:</strong> {{listingStart}} through {{listingEnd}}</p>
<p><a href="{{dashboardUrl}}">Open your dashboard</a></p>
<p>&mdash; ListQik</p>`,
  },
  seller_listing_finalized_scheduled: {
    key: "seller_listing_finalized_scheduled",
    label: "Seller — listing setup complete (scheduled)",
    description: "Sent to the seller when setup is finalized but the listing start date is in the future.",
    variables: ["greetingName", "address", "listingStart", "listingEnd", "dashboardUrl"],
    subject: "Listing setup complete — goes live {{listingStart}}",
    textBody: `Hi {{greetingName}},

We received your completed listing setup for {{address}}. Your listing is scheduled to go live on {{listingStart}}.

Listing period: {{listingStart}} through {{listingEnd}}

Open your dashboard:
{{dashboardUrl}}

— ListQik`,
    htmlBody: `<p>Hi {{greetingName}},</p>
<p>We received your completed listing setup for <strong>{{address}}</strong>. Your listing is scheduled to go live on <strong>{{listingStart}}</strong>.</p>
<p><strong>Listing period:</strong> {{listingStart}} through {{listingEnd}}</p>
<p><a href="{{dashboardUrl}}">Open your dashboard</a></p>
<p>&mdash; ListQik</p>`,
  },
  internal_listing_finalized: {
    key: "internal_listing_finalized",
    label: "Internal — listing setup complete",
    description: "Sent to internal notification recipients when a seller finalizes setup.",
    variables: [
      "address",
      "listingStart",
      "listingEnd",
      "status",
      "finalizedAt",
      "sellerName",
      "sellerEmail",
      "contactPhone",
      "county",
      "planLabel",
      "listPrice",
      "buyerAgentComp",
      "mlsName",
      "mlsNumber",
      "platforms",
      "heroImage",
      "additionalPhotos",
      "documentCount",
      "adminProfileUrl",
    ],
    subject: "Listing setup complete — {{address}} (starts {{listingStart}})",
    textBody: `A seller just finalized their listing setup on ListQik.

Listing period starts: {{listingStart}}
Listing period ends:   {{listingEnd}}
Status after finalize: {{status}}
Setup finalized at:    {{finalizedAt}}

Seller:        {{sellerName}} <{{sellerEmail}}>
Contact phone: {{contactPhone}}

Property:      {{address}}
County:        {{county}}

Plan:          {{planLabel}}
List price:    {{listPrice}}
Buyer agent:   {{buyerAgentComp}}

MLS name:      {{mlsName}}
MLS number:    {{mlsNumber}}
Platforms:     {{platforms}}

Hero image:    {{heroImage}}
Additional photos: {{additionalPhotos}}
Documents uploaded: {{documentCount}}

Open in admin: {{adminProfileUrl}}

— ListQik (automated notification)`,
    htmlBody: "",
  },
  upgrade_purchase_confirmation: {
    key: "upgrade_purchase_confirmation",
    label: "Buyer — upgrade purchase confirmed",
    description: "Sent to the purchaser after an upgrade purchase completes.",
    variables: ["greetingName", "upgradeSummary", "amount", "orderRef", "dashboardUrl"],
    subject: "Upgrade purchase confirmed — {{upgradeSummary}}",
    textBody: `Hi {{greetingName}},

Thank you for your purchase:
{{upgradeSummary}}

Amount: {{amount}}
Order reference: {{orderRef}}
Dashboard: {{dashboardUrl}}

— ListQik`,
    htmlBody: `<p>Hi {{greetingName}},</p>
<p>Thank you for your upgrade purchase:</p>
<p><strong>{{upgradeSummary}}</strong></p>
<p>Amount: {{amount}}</p>
<p>Order reference: {{orderRef}}</p>
<p><a href="{{dashboardUrl}}">Open your dashboard</a></p>
<p>&mdash; ListQik</p>`,
  },
  internal_upgrade_purchase: {
    key: "internal_upgrade_purchase",
    label: "Internal — upgrade purchase",
    description: "Sent to internal notification recipients after an upgrade purchase.",
    variables: [
      "purchaserName",
      "purchaserEmail",
      "upgradeSummary",
      "amount",
      "orderRef",
      "dashboardUrl",
    ],
    subject: "Upgrade purchase — {{purchaserEmail}} ({{upgradeSummary}})",
    textBody: `Upgrade purchase on ListQik.

Buyer: {{purchaserName}} <{{purchaserEmail}}>
Upgrades: {{upgradeSummary}}
Amount: {{amount}}
Order reference: {{orderRef}}
Dashboard: {{dashboardUrl}}

— ListQik (automated notification)`,
    htmlBody: `<p>Upgrade purchase on ListQik.</p>
<p><strong>Buyer:</strong> {{purchaserName}} &lt;{{purchaserEmail}}&gt;</p>
<p><strong>Upgrades:</strong> {{upgradeSummary}}</p>
<p><strong>Amount:</strong> {{amount}}</p>
<p><strong>Order reference:</strong> {{orderRef}}</p>
<p><a href="{{dashboardUrl}}">Open dashboard</a></p>
<p style="color:#6b7280;font-size:12px;">Automated notification from ListQik.</p>`,
  },
};

export function isEmailTemplateKey(value: string): value is EmailTemplateKey {
  return (EMAIL_TEMPLATE_KEYS as readonly string[]).includes(value);
}

export function escapeHtmlForEmail(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderTemplateString(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => vars[key] ?? "");
}

export function textBodyToSimpleHtml(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "<p>&nbsp;</p>";
      const escaped = escapeHtmlForEmail(trimmed);
      const linked = escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1">$1</a>',
      );
      return `<p>${linked}</p>`;
    })
    .join("");
}

export function renderEmailFromTemplate(
  subject: string,
  textBody: string,
  htmlBody: string,
  vars: Record<string, string>,
): { subject: string; text: string; html: string } {
  const text = renderTemplateString(textBody, vars).trim();
  const renderedSubject = renderTemplateString(subject, vars).trim();
  const html = htmlBody.trim()
    ? renderTemplateString(htmlBody, vars).trim()
    : textBodyToSimpleHtml(text);
  return { subject: renderedSubject, text, html };
}
