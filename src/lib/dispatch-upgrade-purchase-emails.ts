import {
  sendInternalUpgradePurchaseEmail,
  sendUpgradePurchaseConfirmationEmail,
} from "@/lib/transactional-email";
import { staticWizardUpgrades } from "@/data/pricing-static-upgrades";

function appBaseUrl(): string {
  const auth = process.env.NEXTAUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
}

function labelsForSlugs(slugs: string[]): string[] {
  return slugs.map((slug) => {
    const match = staticWizardUpgrades.find((u) => u.slug === slug);
    return match?.name ?? slug;
  });
}

export async function dispatchUpgradePurchaseEmails(input: {
  purchaserEmail: string;
  purchaserName?: string | null;
  upgradeSlugs: string[];
  amountTotal?: number | null;
  orderRef?: string | null;
}) {
  const email = input.purchaserEmail.trim().toLowerCase();
  if (!email || input.upgradeSlugs.length === 0) return;

  const dashboardUrl = appBaseUrl() ? `${appBaseUrl()}/dashboard` : null;
  const payload = {
    purchaserEmail: email,
    purchaserName: input.purchaserName ?? null,
    upgradeSlugs: input.upgradeSlugs,
    upgradeLabels: labelsForSlugs(input.upgradeSlugs),
    amountTotal: input.amountTotal ?? null,
    orderRef: input.orderRef ?? null,
    dashboardUrl,
  };

  const [buyer, internal] = await Promise.all([
    sendUpgradePurchaseConfirmationEmail(payload),
    sendInternalUpgradePurchaseEmail(payload),
  ]);

  if (!buyer.sent) {
    console.error("[upgrade-purchase-email] buyer confirmation not sent:", buyer.error);
  }
  if (!internal.sent) {
    console.error("[upgrade-purchase-email] internal notification not sent:", internal.error);
  }
}
