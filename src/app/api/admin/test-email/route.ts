import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { isAdminEmail } from "@/lib/admin";
import { getSmtpMailerStatus, sendTestEmail } from "@/lib/transactional-email";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 }) };
  }
  if (!isAdminEmail(session.user.email)) {
    return { error: NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  const smtp = getSmtpMailerStatus();
  return NextResponse.json({
    ok: true,
    smtp,
  });
}

type PostBody = {
  to?: string;
  subject?: string;
  body?: string;
};

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) return auth.error;

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const result = await sendTestEmail({
    to: body.to ?? "",
    subject: body.subject,
    body: body.body ?? "",
  });

  if (!result.sent) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "Could not send test email." },
      { status: result.error?.includes("configured") ? 503 : 400 },
    );
  }

  return NextResponse.json({ ok: true, message: "Test email sent." });
}
