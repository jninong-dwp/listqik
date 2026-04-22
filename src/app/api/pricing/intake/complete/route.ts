import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { Listing } from "@/models/Listing";
import { PlanPurchase } from "@/models/PlanPurchase";
import { User } from "@/models/User";

type IntakeBody = {
  agreementAccepted?: boolean;
  account?: {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
  plan?: {
    id?: string;
    name?: string;
    price?: string;
  };
  property?: {
    address?: string;
    unit?: string;
    city?: string;
    state?: string;
    zip?: string;
    county?: string;
    propertyType?: string;
  };
  upgrades?: Array<{
    name?: string;
    price?: number;
  }>;
};

export async function POST(req: Request) {
  let body: IntakeBody;
  try {
    body = (await req.json()) as IntakeBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.agreementAccepted) {
    return NextResponse.json(
      { ok: false, error: "You must accept the agreement before creating an account." },
      { status: 400 },
    );
  }

  const fullName = body.account?.fullName?.trim();
  const email = body.account?.email?.toLowerCase().trim();
  const phone = body.account?.phone?.trim();
  const password = body.account?.password?.trim();
  const planId = body.plan?.id?.trim();
  const planName = body.plan?.name?.trim();
  const planPrice = body.plan?.price?.trim();
  const street = body.property?.address?.trim();
  const unit = body.property?.unit?.trim();
  const city = body.property?.city?.trim();
  const state = body.property?.state?.trim();
  const zip = body.property?.zip?.trim();
  const county = body.property?.county?.trim();
  const propertyType = body.property?.propertyType?.trim();

  if (!fullName || !email || !password || !planId || !planName || !street || !city || !state || !zip) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing required intake fields. Name, email, password, plan, and property address are required.",
      },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  await connectDb();

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "An account with this email already exists. Please sign in." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    passwordHash,
    name: fullName,
    phone: phone || undefined,
  });

  await PlanPurchase.create({
    purchaserEmail: email,
    userId: user._id,
    planId,
    planName,
    status: "ACTIVE",
    claimedAt: new Date(),
  });

  const upgradeSummary = (body.upgrades ?? [])
    .map((u) => `${u.name ?? "Upgrade"}${typeof u.price === "number" ? ` ($${u.price})` : ""}`)
    .join(", ");

  const planLabel = planPrice ? `${planName} (${planPrice})` : planName;
  const introDescription = [
    "Draft listing created from pricing intake.",
    propertyType ? `Property type: ${propertyType}.` : "",
    upgradeSummary ? `Selected upgrades: ${upgradeSummary}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  await Listing.create({
    userId: user._id,
    street,
    unit: unit || undefined,
    city,
    state,
    zip,
    county: county || undefined,
    status: "INCOMPLETE",
    planLabel,
    price: 0,
    description: introDescription,
    orderedOn: new Date(),
  });

  return NextResponse.json({ ok: true, userId: user._id.toString() });
}
