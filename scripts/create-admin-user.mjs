/**
 * Create or reset a dashboard login user (for admins after purge or onboarding).
 *
 * Usage:
 *   node scripts/create-admin-user.mjs --email concierge@listqik.com --password "your-password" --name "ListQik Concierge"
 *
 * Admin console access also requires the email in ADMIN_EMAILS (.env.local and production env).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const root = path.resolve(import.meta.dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(path.join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* no .env.local */
  }
}

function arg(name) {
  const idx = process.argv.indexOf(name);
  if (idx < 0 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

const email = (arg("--email") ?? "").trim().toLowerCase();
const password = arg("--password") ?? "";
const name = (arg("--name") ?? "ListQik Admin").trim();

if (!email || !password) {
  console.error("Required: --email and --password");
  process.exit(1);
}

loadEnvLocal();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required.");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    purchasedUpgradeSlugs: { type: [String], default: [] },
    passwordSetupTokenSha256: { type: String, trim: true, sparse: true },
    passwordSetupExpiresAt: { type: Date },
    userAgreementAcknowledgedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const User = mongoose.models.User ?? mongoose.model("User", userSchema);

const passwordHash = await bcrypt.hash(password, 12);

await mongoose.connect(uri);

const existing = await User.findOne({ email }).lean();
if (existing) {
  await User.updateOne(
    { email },
    {
      $set: {
        passwordHash,
        name,
        passwordSetupTokenSha256: null,
        passwordSetupExpiresAt: null,
        userAgreementAcknowledgedAt: new Date(),
      },
    },
  );
  console.log(`Updated existing user: ${email}`);
} else {
  await User.create({
    email,
    passwordHash,
    name,
    userAgreementAcknowledgedAt: new Date(),
  });
  console.log(`Created user: ${email}`);
}

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((v) => v.trim().toLowerCase())
  .filter(Boolean);

if (adminEmails.includes(email)) {
  console.log("ADMIN_EMAILS already includes this email.");
} else {
  console.log(
    "\nAdd this email to ADMIN_EMAILS in .env.local (and production env) for admin console access:",
  );
  console.log(`  ADMIN_EMAILS=${[...adminEmails, email].join(",")}`);
}

await mongoose.disconnect();
