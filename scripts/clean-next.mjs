import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const projectNext = path.join(process.cwd(), ".next");
const localCache =
  process.platform === "win32"
    ? path.join(
        process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"),
        "listpath-next-cache",
      )
    : null;

for (const dir of [projectNext, localCache].filter(Boolean)) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("Removed:", dir);
  } catch (err) {
    console.warn("Could not remove:", dir);
    console.warn(String(err?.message ?? err));
    process.exitCode = 1;
  }
}

if (process.exitCode === 1) {
  console.warn(
    "Close all `npm run dev` / Node processes, pause OneDrive for this folder, then retry.",
  );
}
