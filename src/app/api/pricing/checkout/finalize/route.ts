import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { newPasswordSetupSecret, sha256Hex } from "@/lib/password-setup-token";
import { PricingCheckoutSession } from "@/models/PricingCheckoutSession";
import { User } from "@/models/User";

type FinalizeBody = {
  sessionId?: string;
  destination?: "dashboard" | "upgrades";
};

function appBaseUrl(): string {
  const auth = process.env.NEXTAUTH_URL?.trim();
  if (auth) return auth.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
}

export async function POST(req: Request) {
  let body: FinalizeBody;
  try {
    body = (await req.json()) as FinalizeBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  const destination = body.destination === "upgrades" ? "upgrades" : "dashboard";
  const callbackPath = destination === "upgrades" ? "/upgrades" : "/dashboard";
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "sessionId is required." },
      { status: 400 },
    );
  }

  await connectDb();

  const session = await PricingCheckoutSession.findOne({ sessionId });
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Checkout session not found." },
      { status: 404 },
    );
  }

  if (!session.planPaid) {
    return NextResponse.json(
      {
        ok: false,
        error: "Plan payment not recorded yet. Wait for confirmation and try again.",
      },
      { status: 409 },
    );
  }

  const requiresUpgradePayment =
    Array.isArray(session.selectedUpgradeSlugs) && session.selectedUpgradeSlugs.length > 0;
  if (requiresUpgradePayment && !session.upgradesPaid) {
    return NextResponse.json(
      {
        ok: false,
        error: "Upgrades are selected but payment is not recorded yet.",
      },
      { status: 409 },
    );
  }

  const user = await User.findOne({ email: session.purchaserEmail });
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: "Payment recorded, but user provisioning is still pending. Please retry shortly.",
      },
      { status: 409 },
    );
  }

  const base = appBaseUrl();
  if (!base) {
    return NextResponse.json(
      { ok: false, error: "App base URL is not configured." },
      { status: 500 },
    );
  }

  if (user.passwordSetupTokenSha256) {
    const secret = newPasswordSetupSecret();
    user.passwordSetupTokenSha256 = sha256Hex(secret);
    user.passwordSetupExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await user.save();

    return NextResponse.json({
      ok: true,
      sessionId,
      nextUrl: `${base}/setup-account?token=${encodeURIComponent(secret)}&next=${encodeURIComponent(callbackPath)}`,
      destination: "setup-account",
    });
  }

  return NextResponse.json({
    ok: true,
    sessionId,
    nextUrl: `${base}/login?callbackUrl=${encodeURIComponent(callbackPath)}`,
    destination: "login",
  });
}

