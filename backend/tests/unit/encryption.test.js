import { randomBytes } from "node:crypto";
import { describe, expect, test } from "vitest";
import { env } from "../../src/config/env.js";
import {
  createDataKeyEnc,
  decryptBytes,
  decryptJson,
  encryptBytes,
  encryptJson,
} from "../../src/utils/encryption.js";

const key = randomBytes(32);
const plain = Buffer.from("Jan Kowalski, zażółć gęślą jaźń", "utf8");

describe("data encryption", () => {
  // Encryption and decryption
  test("given data and the key used to encrypt it when decryptBytes then the original is returned", () => {
    // Given
    const stored = encryptBytes(plain, key);

    // When
    const result = decryptBytes(stored, key);

    // Then
    expect(result.equals(plain)).toBe(true);
  });

  test("given an object saved as JSON when decryptJson then the same object is returned", () => {
    // Given
    const value = { name: "CV", skills: ["React"] };
    const stored = encryptJson(value, key);

    // When
    const result = decryptJson(stored, key);

    // Then
    expect(result).toEqual(value);
  });

  test("given a plain text when encryptBytes then the result does not contain the plain text", () => {
    // Given
    const secret = Buffer.from("Jan Kowalski", "utf8");

    // When
    const stored = encryptBytes(secret, key);

    // Then
    expect(stored.includes("Kowalski")).toBe(false);
  });

  test("given the same text twice when encryptBytes then the results differ", () => {
    // Given
    const text = Buffer.from("Ten sam tekst", "utf8");

    // When
    const first = encryptBytes(text, key);
    const second = encryptBytes(text, key);

    // Then
    expect(first.equals(second)).toBe(false);
  });

  test("given a wrong key when decryptBytes then an error is thrown", () => {
    // Given
    const stored = encryptBytes(plain, key);

    // When
    const act = () => decryptBytes(stored, randomBytes(32));

    // Then
    expect(act).toThrow();
  });

  // Tampered encrypted data
  test("given one changed byte in the initialization vector when decryptBytes then an error is thrown", () => {
    // Given
    const position = 0;
    const stored = encryptBytes(plain, key);
    stored[position] ^= 1;

    // When
    const act = () => decryptBytes(stored, key);

    // Then
    expect(act).toThrow();
  });

  test("given one changed byte in the authentication tag when decryptBytes then an error is thrown", () => {
    // Given
    const position = 12;
    const stored = encryptBytes(plain, key);
    stored[position] ^= 1;

    // When
    const act = () => decryptBytes(stored, key);

    // Then
    expect(act).toThrow();
  });

  test("given one changed byte in the content when decryptBytes then an error is thrown", () => {
    // Given
    const position = 28;
    const stored = encryptBytes(plain, key);
    stored[position] ^= 1;

    // When
    const act = () => decryptBytes(stored, key);

    // Then
    expect(act).toThrow();
  });

  // Data key
  test("given the master key when createDataKeyEnc then a 32-byte key is encrypted with it", () => {
    // Given
    const masterKey = env.masterKey;

    // When
    const stored = createDataKeyEnc();

    // Then
    expect(decryptBytes(stored, masterKey)).toHaveLength(32);
  });
});
