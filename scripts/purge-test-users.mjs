/**
 * Removes all seller User accounts and related test data from MongoDB.
 * Does not touch email notification templates or other admin config.
 *
 * Usage:
 *   node scripts/purge-test-users.mjs --dry-run
 *   node scripts/purge-test-users.mjs --confirm
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

/** Delete order: listing children → listings → purchases → checkout sessions → users */
const COLLECTION_SUFFIXES = [
  "listingoffers",
  "listingdocuments",
  "listingopenhouses",
  "listingmlsexportjobs",
  "listingupgraderequests",
  "listings",
  "planpurchases",
  "upgradepurchases",
  "pricingcheckoutsessions",
  "users",
];

function resolveCollections(existingNames) {
  const lower = new Map(existingNames.map((n) => [n.toLowerCase(), n]));
  const resolved = [];
  for (const suffix of COLLECTION_SUFFIXES) {
    const match = lower.get(suffix);
    if (match) resolved.push(match);
  }
  return resolved;
}

async function countAll(db, names) {
  const counts = {};
  for (const name of names) {
    counts[name] = await db.collection(name).countDocuments();
  }
  return counts;
}

async function main() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("Missing MONGODB_URI in .env.local");

  const dryRun = process.argv.includes("--dry-run");
  const confirm = process.argv.includes("--confirm");
  if (!dryRun && !confirm) {
    console.error("Pass --dry-run to preview or --confirm to delete.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const existing = (await db.listCollections().toArray()).map((c) => c.name);
  const targets = resolveCollections(existing);
  if (!targets.length) {
    console.error("No matching collections found. Existing:", existing.join(", ") || "(none)");
    await mongoose.disconnect();
    process.exit(1);
  }

  const before = await countAll(db, targets);
  console.log("Documents before purge:");
  for (const [name, count] of Object.entries(before)) {
    console.log(`  ${name}: ${count}`);
  }

  const usersCollection = targets.find((n) => n.toLowerCase() === "users");
  if (usersCollection) {
    const userEmails = await db
      .collection(usersCollection)
      .find({}, { projection: { email: 1, name: 1 } })
      .toArray();
    if (userEmails.length) {
      console.log("\nUsers:");
      for (const u of userEmails) {
        console.log(`  - ${u.email} (${u.name ?? "no name"})`);
      }
    }
  }

  if (dryRun) {
    console.log("\nDry run only — no data deleted.");
    await mongoose.disconnect();
    return;
  }

  for (const name of targets) {
    const result = await db.collection(name).deleteMany({});
    console.log(`Deleted ${result.deletedCount} from ${name}`);
  }

  const after = await countAll(db, targets);
  console.log("\nDocuments after purge:");
  for (const [name, count] of Object.entries(after)) {
    console.log(`  ${name}: ${count}`);
  }

  await mongoose.disconnect();
  console.log("\nDone. Email notification templates were not modified.");
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
