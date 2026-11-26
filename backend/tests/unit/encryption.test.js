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
    // Arrange
    const stored = encryptBytes(plain, key);

    // Act
    const result = decryptBytes(stored, key);

    // Assert
    expect(result.equals(plain)).toBe(true);
  });

  test("given an object saved as JSON when decryptJson then the same object is returned", () => {
    // Arrange
    const value = { name: "CV", skills: ["React"] };
    const stored = encryptJson(value, key);

    // Act
    const result = decryptJson(stored, key);

    // Assert
    expect(result).toEqual(value);
  });

  test("given a plain text when encryptBytes then the result does not contain the plain text", () => {
    // Arrange
    const secret = Buffer.from("Jan Kowalski", "utf8");

    // Act
    const stored = encryptBytes(secret, key);

    // Assert
    expect(stored.includes("Kowalski")).toBe(false);
  });

  test("given the same text twice when encryptBytes then the results differ", () => {
    // Arrange
    const text = Buffer.from("Ten sam tekst", "utf8");

    // Act
    const first = encryptBytes(text, key);
    const second = encryptBytes(text, key);

    // Assert
    expect(first.equals(second)).toBe(false);
  });

  test("given a wrong key when decryptBytes then an error is thrown", () => {
    // Arrange
    const stored = encryptBytes(plain, key);

    // Act
    const act = () => decryptBytes(stored, randomBytes(32));

    // Assert
    expect(act).toThrow();
  });

  // Tampered encrypted data
  test("given one changed byte in the initialization vector when decryptBytes then an error is thrown", () => {
    // Arrange
    const position = 0;
    const stored = encryptBytes(plain, key);
    stored[position] ^= 1;

    // Act
    const act = () => decryptBytes(stored, key);

    // Assert
    expect(act).toThrow();
  });

  test("given one changed byte in the authentication tag when decryptBytes then an error is thrown", () => {
    // Arrange
    const position = 12;
    const stored = encryptBytes(plain, key);
    stored[position] ^= 1;

    // Act
    const act = () => decryptBytes(stored, key);

    // Assert
    expect(act).toThrow();
  });

  test("given one changed byte in the content when decryptBytes then an error is thrown", () => {
    // Arrange
    const position = 28;
    const stored = encryptBytes(plain, key);
    stored[position] ^= 1;

    // Act
    const act = () => decryptBytes(stored, key);

    // Assert
    expect(act).toThrow();
  });

  // Data key
  test("given the master key when createDataKeyEnc then a 32-byte key is encrypted with it", () => {
    // Arrange
    const masterKey = env.masterKey;

    // Act
    const stored = createDataKeyEnc();

    // Assert
    expect(decryptBytes(stored, masterKey)).toHaveLength(32);
  });
});
