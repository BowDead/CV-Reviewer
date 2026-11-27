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
    // Given
    const text = "Kontakt: jan.kowalski@example.com";
    const expected = "Kontakt: [EMAIL]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a phone with spaces when anonymize then the phone is replaced with [TELEFON]", () => {
    // Given
    const text = "Tel: 600 700 800";
    const expected = "Tel: [TELEFON]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a phone with a prefix when anonymize then the phone is replaced with [TELEFON]", () => {
    // Given
    const text = "Tel: +48 600-700-800";
    const expected = "Tel: [TELEFON]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a PESEL number when anonymize then the PESEL is replaced with [PESEL]", () => {
    // Given
    const text = "PESEL: 90010112345";
    const expected = "PESEL: [PESEL]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a GitHub profile when anonymize then the link is replaced with [LINK GITHUB]", () => {
    // Given
    const text = "https://github.com/jkowalski";
    const expected = "[LINK GITHUB]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a LinkedIn profile when anonymize then the link is replaced with [LINK LINKEDIN]", () => {
    // Given
    const text = "linkedin.com/in/jkowalski";
    const expected = "[LINK LINKEDIN]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given another link when anonymize then the link is replaced with [LINK]", () => {
    // Given
    const text = "Blog: https://moj-blog.pl";
    const expected = "Blog: [LINK]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given an address with a street when anonymize then the address is replaced with [ADRES]", () => {
    // Given
    const text = "Adres: ul. Długa 12/3";
    const expected = "Adres: [ADRES]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given an address without a street when anonymize then the address is replaced with [ADRES]", () => {
    // Given
    const text = "Lipowa 5, 33-100 Tarnów";
    const expected = "[ADRES]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a postal code when anonymize then the postal code is replaced with [KOD POCZTOWY]", () => {
    // Given
    const text = "Okolice 33-100";
    const expected = "Okolice [KOD POCZTOWY]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  test("given a birth date when anonymize then the date is replaced with [DATA]", () => {
    // Given
    const text = "Data urodzenia: 01.02.1999";
    const expected = "Data urodzenia: [DATA]";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(expected);
  });

  // Ordinary CV content left unchanged
  test("given an employment period when anonymize then the period stays unchanged", () => {
    // Given
    const text = "Programista, 2019 - 2023";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(text);
  });

  test("given a number of users when anonymize then the number stays unchanged", () => {
    // Given
    const text = "Aplikacja dla 15000 osób";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(text);
  });

  test("given technology names when anonymize then the names stay unchanged", () => {
    // Given
    const text = "Node.js, ASP.NET, C++";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(text);
  });

  // Whole CV text
  test("given a full name repeated in the text when anonymize then every occurrence is hidden", () => {
    // Given
    const text = "Jan Kowalski\nProgramista\nPodpis: Jan Kowalski";

    // When
    const segments = anonymize(text);

    // Then
    expect(toLabels(segments)).toBe(
      "[IMIĘ I NAZWISKO]\nProgramista\nPodpis: [IMIĘ I NAZWISKO]",
    );
  });

  test("given a text with personal data when anonymize then the segments join into the original text", () => {
    // Given
    const text = "Jan Kowalski\njan@example.com, tel. 600 700 800\nJava";

    // When
    const segments = anonymize(text);

    // Then
    expect(segments.map((segment) => segment.text).join("")).toBe(text);
  });
});

describe("full name recognition", () => {
  // Name formats
  test("given a full name in a plain line when guessFullName then the name is returned", () => {
    // Given
    const text = "Anna Nowak\nTester";
    const expected = "Anna Nowak";

    // When
    const result = guessFullName(text);

    // Then
    expect(result).toBe(expected);
  });

  test("given a full name in a Markdown heading when guessFullName then the name is returned", () => {
    // Given
    const text = "# Anna Nowak\n\n**Tester**";
    const expected = "Anna Nowak";

    // When
    const result = guessFullName(text);

    // Then
    expect(result).toBe(expected);
  });

  test("given a double surname when guessFullName then the whole name is returned", () => {
    // Given
    const text = "Anna Nowak-Zięba\nTester";
    const expected = "Anna Nowak-Zięba";

    // When
    const result = guessFullName(text);

    // Then
    expect(result).toBe(expected);
  });

  // Missing name
  test("given no name in the first three lines when guessFullName then null is returned", () => {
    // Given
    const text = "CV\nprogramista\n2024\nAnna Nowak";

    // When
    const result = guessFullName(text);

    // Then
    expect(result).toBeNull();
  });
});

describe("input validation", () => {
  // Invalid input
  test("given no text when anonymizeCv then CV_TEXT_MISSING is thrown", () => {
    // Given
    const text = undefined;
    const code = "CV_TEXT_MISSING";
    const status = 400;

    // When
    const act = () => anonymizeCv(text);

    // Then
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given only spaces when anonymizeCv then CV_TEXT_MISSING is thrown", () => {
    // Given
    const text = "   ";
    const code = "CV_TEXT_MISSING";
    const status = 400;

    // When
    const act = () => anonymizeCv(text);

    // Then
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given a text over the limit when anonymizeCv then CV_TEXT_TOO_LONG is thrown", () => {
    // Given
    const text = "a".repeat(50_001);
    const code = "CV_TEXT_TOO_LONG";
    const status = 413;

    // When
    const act = () => anonymizeCv(text);

    // Then
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });
});
