/**
 * Windows: map project .next -> %LOCALAPPDATA%\\listpath-next-cache so build output
 * is not under OneDrive-synced Documents (reduces EPERM locks on .next/trace).
 * Idempotent. If .next already exists as a real folder, print a hint and exit 0.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const nextPath = path.join(projectRoot, ".next");
const target = path.join(
  process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"),
  "listpath-next-cache",
);

if (process.platform !== "win32") {
  process.exit(0);
}

fs.mkdirSync(target, { recursive: true });

if (!fs.existsSync(nextPath)) {
  fs.symlinkSync(target, nextPath, "junction");
  console.log("[listpath] Created junction .next ->", target);
  process.exit(0);
}

let stat;
try {
  stat = fs.lstatSync(nextPath);
} catch {
  process.exit(0);
}

if (stat.isSymbolicLink()) {
  process.exit(0);
}

console.warn(
  "[listpath] .next exists as a normal folder. Stop dev, delete .next, then run npm run dev again to create the junction (avoids OneDrive trace locks).",
);
