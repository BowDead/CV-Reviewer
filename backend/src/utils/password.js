import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(
    password.normalize("NFKC"),
    salt,
    KEY_LENGTH,
    SCRYPT_PARAMS,
  );
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, saltBase64, hashBase64] = storedHash.split("$");
  if (algorithm !== "scrypt" || !saltBase64 || !hashBase64) {
    return false;
  }

  const expected = Buffer.from(hashBase64, "base64");
  const actual = await scryptAsync(
    password.normalize("NFKC"),
    Buffer.from(saltBase64, "base64"),
    expected.length,
    SCRYPT_PARAMS,
  );
  return timingSafeEqual(actual, expected);
}
