import crypto from "node:crypto";

const ALGO = "aes-256-cbc";
const KEY_FALLBACK = "vault-pay-default-card-encryption-key-change-me-32";

function getKey(): Buffer {
  const raw = process.env.CARD_ENC_KEY ?? KEY_FALLBACK;
  // 32-byte key for AES-256.
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptPan(pan: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(pan, "utf8"), cipher.final()]);
  return `${iv.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptPan(blob: string): string {
  const [ivB64, ctB64] = blob.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const ct = Buffer.from(ctB64, "base64");
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
  return dec.toString("utf8");
}

export function last4(pan: string): string {
  return pan.slice(-4);
}
