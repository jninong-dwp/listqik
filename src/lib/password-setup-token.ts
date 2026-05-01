import { createHash, randomBytes } from "crypto";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function newPasswordSetupSecret(): string {
  return randomBytes(24).toString("base64url");
}
