import { NextResponse } from "next/server";

type CheckoutPayload = {
  source?: string;
  plan?: {
    id?: string;
    name?: string;
    price?: string;
    closeFee?: string;
  };
  contact?: {
    fullName?: string;
    email?: string;
    phone?: string;
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
    slug?: string;
    name?: string;
    price?: number;
    ghlProductId?: string;
  }>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!isObject(body)) {
    return NextResponse.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const payload = body as CheckoutPayload;
  const name = payload.contact?.fullName?.trim();
  const email = payload.contact?.email?.trim();
  const phone = payload.contact?.phone?.trim();
  const address = payload.property?.address?.trim();
  const propertyType = payload.property?.propertyType?.trim();

  if (!name || !email || !phone || !address || !propertyType || !payload.plan?.id) {
    return NextResponse.json(
      { ok: false, error: "Missing required plan/contact/property fields." },
      { status: 400 },
    );
  }

  const webhookUrl = process.env.GHL_PRICING_WEBHOOK_URL;
  if (webhookUrl) {
    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...payload,
        receivedAt: new Date().toISOString(),
        userAgent: req.headers.get("user-agent") ?? undefined,
      }),
    });

    if (!webhookRes.ok) {
      const details = await webhookRes.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: "GHL pricing webhook failed.",
          status: webhookRes.status,
          details,
        },
        { status: 502 },
      );
    }
  }

  const checkoutBase = process.env.GHL_STORE_CHECKOUT_BASE_URL;
  if (!checkoutBase) {
    return NextResponse.json({
      ok: true,
      checkoutUrl: null,
      warning: "Set GHL_STORE_CHECKOUT_BASE_URL to enable checkout redirect.",
    });
  }

  const upgradeIds = (payload.upgrades ?? [])
    .map((u) => u.ghlProductId)
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  const url = new URL(checkoutBase);
  url.searchParams.set("plan", payload.plan.id);
  url.searchParams.set("name", name);
  url.searchParams.set("email", email);
  url.searchParams.set("phone", phone);
  url.searchParams.set("address", address);
  url.searchParams.set("propertyType", propertyType);
  if (upgradeIds.length > 0) {
    url.searchParams.set("products", upgradeIds.join(","));
  }

  return NextResponse.json({
    ok: true,
    checkoutUrl: url.toString(),
  });
}

