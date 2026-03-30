import { NextResponse } from "next/server";

type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  consent: boolean;
  listing?: {
    slug?: string;
    title?: string;
    city?: string;
    state?: string;
    price?: number;
    url?: string;
  };
  source?: string;
  utm?: Record<string, string | undefined>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

export async function POST(req: Request) {
  const webhookUrl = process.env.GHL_LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "Missing GHL_LEAD_WEBHOOK_URL" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!isObject(body)) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  // Basic honeypot (bots often fill hidden fields).
  if (readString(body, "company")) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const payload = body as Partial<LeadPayload>;

  if (typeof payload.name !== "string" || payload.name.trim().length < 2) {
    return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
  }
  if (typeof payload.email !== "string" || !payload.email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
  }
  if (payload.consent !== true) {
    return NextResponse.json(
      { ok: false, error: "Consent is required" },
      { status: 400 },
    );
  }

  const ghlResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      receivedAt: new Date().toISOString(),
      userAgent: req.headers.get("user-agent") ?? undefined,
    }),
  });

  if (!ghlResponse.ok) {
    const text = await ghlResponse.text().catch(() => "");
    return NextResponse.json(
      { ok: false, error: "GHL webhook failed", status: ghlResponse.status, details: text },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

