import { describe, expect, test } from "vitest";
import { hashPassword, verifyPassword } from "../../src/utils/password.js";

const PASSWORD = "Haslo12345";

describe("passwords", () => {
  // Hashing and verification
  test("given a correct password when verifyPassword then the password is accepted", async () => {
    // Given
    const hash = await hashPassword(PASSWORD);

    // When
    const result = await verifyPassword(PASSWORD, hash);

    // Then
    expect(result).toBe(true);
  });

  test("given a wrong password when verifyPassword then the password is rejected", async () => {
    // Given
    const hash = await hashPassword(PASSWORD);

    // When
    const result = await verifyPassword("haslo12345", hash);

    // Then
    expect(result).toBe(false);
  });

  test("given a password when hashPassword then the hash does not contain the password", async () => {
    // Given
    const password = "TajneHaslo1";

    // When
    const hash = await hashPassword(password);

    // Then
    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain(password);
  });

  test("given the same password twice when hashPassword then the hashes differ", async () => {
    // Given
    const password = "TajneHaslo1";

    // When
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    // Then
    expect(first).not.toBe(second);
  });

  // Malformed stored hashes
  test("given a stored hash with an empty value when verifyPassword then the password is rejected", async () => {
    // Given
    const stored = "";

    // When
    const result = await verifyPassword(PASSWORD, stored);

    // Then
    expect(result).toBe(false);
  });

  test("given a stored hash with no parts when verifyPassword then the password is rejected", async () => {
    // Given
    const stored = "zwykly-tekst";

    // When
    const result = await verifyPassword(PASSWORD, stored);

    // Then
    expect(result).toBe(false);
  });

  test("given a stored hash with another algorithm when verifyPassword then the password is rejected", async () => {
    // Given
    const stored = "bcrypt$sol$skrot";

    // When
    const result = await verifyPassword(PASSWORD, stored);

    // Then
    expect(result).toBe(false);
  });

  test("given a stored hash with no hash part when verifyPassword then the password is rejected", async () => {
    // Given
    const stored = "scrypt$sol";

    // When
    const result = await verifyPassword(PASSWORD, stored);

    // Then
    expect(result).toBe(false);
  });
});
