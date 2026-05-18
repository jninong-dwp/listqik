import type { ProvisionSellerResult } from "@/lib/seller-order-provision";
import {
  sendExistingAccountAccessEmail,
  sendExistingAccountNewPlanEmail,
  sendSetupAccountEmail,
} from "@/lib/transactional-email";

export type PostPurchaseAccountEmailType =
  | "setup"
  | "existing-login"
  | "existing-new-plan"
  | null;

export type PostPurchaseAccountEmailResult = {
  type: PostPurchaseAccountEmailType;
  sent: boolean;
  error: string | null;
};

function appBaseUrl(): string {
  const auth = process.env.NEXTAUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
}

function loginUrlWithCallback(path: string): string {
  const base = appBaseUrl();
  if (!base) return "";
  return `${base}/login?callbackUrl=${encodeURIComponent(path)}`;
}

/**
 * Sends the correct post-checkout account email for plan purchases.
 * Skips email on duplicate webhook retries.
 */
export async function dispatchPostPurchaseAccountEmail(input: {
  email: string;
  fullName?: string;
  provision: ProvisionSellerResult;
}): Promise<PostPurchaseAccountEmailResult> {
  const email = input.email.trim();
  if (!email) {
    return { type: null, sent: false, error: "Missing buyer email for account access email." };
  }

  if (input.provision.status === "duplicate") {
    return { type: null, sent: false, error: null };
  }

  const base = appBaseUrl();
  if (!base) {
    return { type: null, sent: false, error: "App base URL is not configured for account email." };
  }

  if (input.provision.createdUser && input.provision.setupAccountUrl) {
    const sent = await sendSetupAccountEmail({
      to: email,
      fullName: input.fullName,
      setupAccountUrl: input.provision.setupAccountUrl,
      firstLoginPath: "/dashboard",
    });
    return {
      type: "setup",
      sent: sent.sent,
      error: sent.sent ? null : sent.error ?? "Setup email send failed.",
    };
  }

  if (input.provision.linkedToUser) {
    const dashboardUrl = loginUrlWithCallback("/dashboard");
    const listingSetupPath = input.provision.listingId
      ? `/dashboard/listings/${input.provision.listingId}/setup`
      : null;
    const listingSetupUrl = listingSetupPath ? loginUrlWithCallback(listingSetupPath) : "";

    const listingSetupCta = listingSetupUrl
      ? `Go straight to your new listing setup:\n${listingSetupUrl}`
      : "Open your dashboard to find your new listing and complete setup.";

    const sent = await sendExistingAccountNewPlanEmail({
      to: email,
      fullName: input.fullName,
      planName: input.provision.planName,
      propertyAddress: input.provision.propertyAddress,
      dashboardUrl,
      listingSetupCta,
    });
    return {
      type: "existing-new-plan",
      sent: sent.sent,
      error: sent.sent ? null : sent.error ?? "New-plan email send failed.",
    };
  }

  const loginUrl = loginUrlWithCallback("/dashboard");
  const sent = await sendExistingAccountAccessEmail({
    to: email,
    fullName: input.fullName,
    loginUrl,
  });
  return {
    type: "existing-login",
    sent: sent.sent,
    error: sent.sent ? null : sent.error ?? "Existing-account email send failed.",
  };
}
