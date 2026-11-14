import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const DATA_KEY_LENGTH = 32;

export function encryptBytes(plain, key) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
}
export function decryptBytes(stored, key) {
  const iv = stored.subarray(0, IV_LENGTH);
  const tag = stored.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = stored.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

export function encryptJson(value, key) {
  return encryptBytes(Buffer.from(JSON.stringify(value), "utf8"), key);
}

export function decryptJson(stored, key) {
  return JSON.parse(decryptBytes(stored, key).toString("utf8"));
}

export function createDataKeyEnc() {
  return encryptBytes(randomBytes(DATA_KEY_LENGTH), env.masterKey);
}
