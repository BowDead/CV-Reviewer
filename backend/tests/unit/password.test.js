import { describe, expect, test } from "vitest";
import { hashPassword, verifyPassword } from "../../src/utils/password.js";

const PASSWORD = "Haslo12345";

describe("passwords", () => {
  // Hashing and verification
  test("given a correct password when verifyPassword then the password is accepted", async () => {
    // Arrange
    const hash = await hashPassword(PASSWORD);

    // Act
    const result = await verifyPassword(PASSWORD, hash);

    // Assert
    expect(result).toBe(true);
  });

  test("given a wrong password when verifyPassword then the password is rejected", async () => {
    // Arrange
    const hash = await hashPassword(PASSWORD);

    // Act
    const result = await verifyPassword("haslo12345", hash);

    // Assert
    expect(result).toBe(false);
  });

  test("given a password when hashPassword then the hash does not contain the password", async () => {
    // Arrange
    const password = "TajneHaslo1";

    // Act
    const hash = await hashPassword(password);

    // Assert
    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain(password);
  });

  test("given the same password twice when hashPassword then the hashes differ", async () => {
    // Arrange
    const password = "TajneHaslo1";

    // Act
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    // Assert
    expect(first).not.toBe(second);
  });

  // Malformed stored hashes
  test("given a stored hash with an empty value when verifyPassword then the password is rejected", async () => {
    // Arrange
    const stored = "";

    // Act
    const result = await verifyPassword(PASSWORD, stored);

    // Assert
    expect(result).toBe(false);
  });

  test("given a stored hash with no parts when verifyPassword then the password is rejected", async () => {
    // Arrange
    const stored = "zwykly-tekst";

    // Act
    const result = await verifyPassword(PASSWORD, stored);

    // Assert
    expect(result).toBe(false);
  });

  test("given a stored hash with another algorithm when verifyPassword then the password is rejected", async () => {
    // Arrange
    const stored = "bcrypt$sol$skrot";

    // Act
    const result = await verifyPassword(PASSWORD, stored);

    // Assert
    expect(result).toBe(false);
  });

  test("given a stored hash with no hash part when verifyPassword then the password is rejected", async () => {
    // Arrange
    const stored = "scrypt$sol";

    // Act
    const result = await verifyPassword(PASSWORD, stored);

    // Assert
    expect(result).toBe(false);
  });
});
