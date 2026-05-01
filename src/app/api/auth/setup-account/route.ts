import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/mongodb";
import { sha256Hex } from "@/lib/password-setup-token";
import { User } from "@/models/User";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const token =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { token?: unknown }).token === "string"
      ? (body as { token: string }).token.trim()
      : "";
  const password =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { password?: unknown }).password === "string"
      ? (body as { password: string }).password
      : "";

  if (token.length < 16 || password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Invalid token or password must be at least 8 characters." },
      { status: 400 },
    );
  }

  await connectDb();

  const sha = sha256Hex(token);
  const user = await User.findOne({
    passwordSetupTokenSha256: sha,
    passwordSetupExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "Invalid or expired link." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash },
      $unset: { passwordSetupTokenSha256: "", passwordSetupExpiresAt: "" },
    },
  );

  return NextResponse.json({ ok: true });
}
