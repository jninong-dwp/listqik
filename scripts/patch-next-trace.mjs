/**
 * Next writes to .next/trace via a WriteStream; on Windows (OneDrive/AV) open can
 * fail with EPERM and crash the process if no "error" listener is attached.
 * Patch is idempotent and safe to re-run after `npm install`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "node_modules/next/dist/trace/report/to-json.js");

if (!fs.existsSync(file)) {
  console.warn("patch-next-trace: next not installed yet; skip");
  process.exit(0);
}

let s = fs.readFileSync(file, "utf8");
if (s.includes("LISTPATH_TRACE_PATCH")) {
  process.exit(0);
}

const needle =
  "this.writeStream = _fs.default.createWriteStream(this.file, writeStreamOptions);";
if (!s.includes(needle)) {
  console.warn("patch-next-trace: unexpected next/dist/trace/report/to-json.js; skip");
  process.exit(0);
}

const patch = `${needle}
        // LISTPATH_TRACE_PATCH: avoid unhandled 'error' when Windows blocks .next/trace
        if (this.writeStream) this.writeStream.on("error", () => {});`;

fs.writeFileSync(file, s.replace(needle, patch));
console.log("patch-next-trace: applied (trace WriteStream error handler)");
