import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-options";
import { connectDb } from "@/lib/mongodb";
import { getEffectivePlanAccessForUser } from "@/lib/plan-access";
import { User } from "@/models/User";

type PatchBody = {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  await connectDb();
  const userId = new Types.ObjectId(session.user.id);
  const user = await User.findById(userId).lean();
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }
  const effectivePlan = await getEffectivePlanAccessForUser(userId);

  return NextResponse.json({
    ok: true,
    effectivePlan,
    profile: { name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "" },
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  await connectDb();
  const user = await User.findById(new Types.ObjectId(session.user.id));
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
  }

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
    user.name = name;
  }
  if (body.phone !== undefined) {
    user.phone = body.phone.trim();
  }
  if (body.newPassword !== undefined) {
    const current = String(body.currentPassword ?? "");
    const next = body.newPassword;
    if (next.length < 8) {
      return NextResponse.json({ ok: false, error: "New password must be at least 8 characters." }, { status: 400 });
    }
    const valid = await bcrypt.compare(current, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 400 });
    }
    user.passwordHash = await bcrypt.hash(next, 10);
  }

  await user.save();
  return NextResponse.json({ ok: true });
}
