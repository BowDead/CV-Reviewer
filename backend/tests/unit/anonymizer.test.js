import { describe, expect, test } from "vitest";
import {
  anonymize,
  anonymizeCv,
  guessFullName,
} from "../../src/services/anonymizer.service.js";

function toLabels(segments) {
  return segments.map((segment) => segment.label ?? segment.text).join("");
}

describe("personal data anonymization", () => {
  // Personal data replaced with labels
  test("given an email when anonymize then the email is replaced with [EMAIL]", () => {
    // Arrange
    const text = "Kontakt: jan.kowalski@example.com";
    const expected = "Kontakt: [EMAIL]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a phone with spaces when anonymize then the phone is replaced with [TELEFON]", () => {
    // Arrange
    const text = "Tel: 600 700 800";
    const expected = "Tel: [TELEFON]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a phone with a prefix when anonymize then the phone is replaced with [TELEFON]", () => {
    // Arrange
    const text = "Tel: +48 600-700-800";
    const expected = "Tel: [TELEFON]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a PESEL number when anonymize then the PESEL is replaced with [PESEL]", () => {
    // Arrange
    const text = "PESEL: 90010112345";
    const expected = "PESEL: [PESEL]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a GitHub profile when anonymize then the link is replaced with [LINK GITHUB]", () => {
    // Arrange
    const text = "https://github.com/jkowalski";
    const expected = "[LINK GITHUB]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a LinkedIn profile when anonymize then the link is replaced with [LINK LINKEDIN]", () => {
    // Arrange
    const text = "linkedin.com/in/jkowalski";
    const expected = "[LINK LINKEDIN]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given another link when anonymize then the link is replaced with [LINK]", () => {
    // Arrange
    const text = "Blog: https://moj-blog.pl";
    const expected = "Blog: [LINK]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given an address with a street when anonymize then the address is replaced with [ADRES]", () => {
    // Arrange
    const text = "Adres: ul. Długa 12/3";
    const expected = "Adres: [ADRES]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given an address without a street when anonymize then the address is replaced with [ADRES]", () => {
    // Arrange
    const text = "Lipowa 5, 33-100 Tarnów";
    const expected = "[ADRES]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a postal code when anonymize then the postal code is replaced with [KOD POCZTOWY]", () => {
    // Arrange
    const text = "Okolice 33-100";
    const expected = "Okolice [KOD POCZTOWY]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a birth date when anonymize then the date is replaced with [DATA]", () => {
    // Arrange
    const text = "Data urodzenia: 01.02.1999";
    const expected = "Data urodzenia: [DATA]";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(expected);
  });

  // Ordinary CV content left unchanged
  test("given an employment period when anonymize then the period stays unchanged", () => {
    // Arrange
    const text = "Programista, 2019 - 2023";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(text);
  });

  test("given a number of users when anonymize then the number stays unchanged", () => {
    // Arrange
    const text = "Aplikacja dla 15000 osób";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(text);
  });

  test("given technology names when anonymize then the names stay unchanged", () => {
    // Arrange
    const text = "Node.js, ASP.NET, C++";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(text);
  });

  // Whole CV text
  test("given a full name repeated in the text when anonymize then every occurrence is hidden", () => {
    // Arrange
    const text = "Jan Kowalski\nProgramista\nPodpis: Jan Kowalski";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(toLabels(segments)).toBe(
      "[IMIĘ I NAZWISKO]\nProgramista\nPodpis: [IMIĘ I NAZWISKO]",
    );
  });

  test("given a text with personal data when anonymize then the segments join into the original text", () => {
    // Arrange
    const text = "Jan Kowalski\njan@example.com, tel. 600 700 800\nJava";

    // Act
    const segments = anonymize(text);

    // Assert
    expect(segments.map((segment) => segment.text).join("")).toBe(text);
  });
});

describe("full name recognition", () => {
  // Name formats
  test("given a full name in a plain line when guessFullName then the name is returned", () => {
    // Arrange
    const text = "Anna Nowak\nTester";
    const expected = "Anna Nowak";

    // Act
    const result = guessFullName(text);

    // Assert
    expect(result).toBe(expected);
  });

  test("given a full name in a Markdown heading when guessFullName then the name is returned", () => {
    // Arrange
    const text = "# Anna Nowak\n\n**Tester**";
    const expected = "Anna Nowak";

    // Act
    const result = guessFullName(text);

    // Assert
    expect(result).toBe(expected);
  });

  test("given a double surname when guessFullName then the whole name is returned", () => {
    // Arrange
    const text = "Anna Nowak-Zięba\nTester";
    const expected = "Anna Nowak-Zięba";

    // Act
    const result = guessFullName(text);

    // Assert
    expect(result).toBe(expected);
  });

  // Missing name
  test("given no name in the first three lines when guessFullName then null is returned", () => {
    // Arrange
    const text = "CV\nprogramista\n2024\nAnna Nowak";

    // Act
    const result = guessFullName(text);

    // Assert
    expect(result).toBeNull();
  });
});

describe("input validation", () => {
  // Invalid input
  test("given no text when anonymizeCv then CV_TEXT_MISSING is thrown", () => {
    // Arrange
    const text = undefined;
    const code = "CV_TEXT_MISSING";
    const status = 400;

    // Act
    const act = () => anonymizeCv(text);

    // Assert
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given only spaces when anonymizeCv then CV_TEXT_MISSING is thrown", () => {
    // Arrange
    const text = "   ";
    const code = "CV_TEXT_MISSING";
    const status = 400;

    // Act
    const act = () => anonymizeCv(text);

    // Assert
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given a text over the limit when anonymizeCv then CV_TEXT_TOO_LONG is thrown", () => {
    // Arrange
    const text = "a".repeat(50_001);
    const code = "CV_TEXT_TOO_LONG";
    const status = 413;

    // Act
    const act = () => anonymizeCv(text);

    // Assert
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });
});
