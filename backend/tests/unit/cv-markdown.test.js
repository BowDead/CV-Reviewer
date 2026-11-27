import { describe, expect, test } from "vitest";
import {
  buildCvMarkdown,
  normalizeCreatorCv,
} from "../../src/utils/cv-markdown.js";

describe("creator data cleanup", () => {
  test("given repeated and empty skills when normalizeCreatorCv then the repeated and empty skills are removed", () => {
    // Given
    const fields = {
      headline: "Tester",
      skills: [" React ", "react", "", "SQL"],
    };

    // When
    const result = normalizeCreatorCv(fields);

    // Then
    expect(result.skills).toEqual(["React", "SQL"]);
  });

  test("given empty list entries when normalizeCreatorCv then the empty entries are skipped", () => {
    // Given
    const fields = {
      headline: "Tester",
      experience: [{ title: " ", company: "" }, { title: "Tester" }],
      education: [{ degree: "", school: "" }],
      languages: [{ name: "", level: "B2" }],
    };

    // When
    const result = normalizeCreatorCv(fields);

    // Then
    expect(result.experience).toHaveLength(1);
    expect(result.education).toEqual([]);
    expect(result.languages).toEqual([]);
  });
});

describe("CV Markdown building", () => {
  test("given no full name when buildCvMarkdown then the headline is the title", () => {
    // Given
    const fields = { headline: "Frontend Developer" };
    const cv = normalizeCreatorCv(fields);

    // When
    const result = buildCvMarkdown(cv);

    // Then
    expect(result).toBe("# Frontend Developer");
  });

  test("given an email and a phone when buildCvMarkdown then the email and phone share one line", () => {
    // Given
    const fields = {
      fullName: "Anna Nowak",
      headline: "Tester",
      email: "anna@example.com",
      phone: "600 700 800",
    };
    const cv = normalizeCreatorCv(fields);

    // When
    const result = buildCvMarkdown(cv);

    // Then
    expect(result).toBe(
      "# Anna Nowak\n\n**Tester**\n\nanna@example.com · 600 700 800",
    );
  });

  test("given sections without data when buildCvMarkdown then the empty sections are skipped", () => {
    // Given
    const fields = { headline: "Tester", skills: ["SQL"] };
    const cv = normalizeCreatorCv(fields);

    // When
    const result = buildCvMarkdown(cv);

    // Then
    expect(result).toBe("# Tester\n\n## Umiejętności\n\nSQL");
  });

  test("given a job with a period and highlights when buildCvMarkdown then the job, period and highlights are written", () => {
    // Given
    const fields = {
      headline: "Tester",
      experience: [
        {
          title: "Tester",
          company: "Firma",
          start: "2024",
          end: "2026",
          highlights: ["Testy API", " "],
        },
      ],
    };
    const cv = normalizeCreatorCv(fields);

    // When
    const result = buildCvMarkdown(cv);

    // Then
    expect(result).toBe(
      "# Tester\n\n## Doświadczenie\n\n### Tester, Firma\n2024 – 2026\n\n- Testy API",
    );
  });

  test("given education and languages when buildCvMarkdown then both sections are written", () => {
    // Given
    const fields = {
      headline: "Tester",
      education: [{ degree: "Informatyka", school: "Uczelnia" }],
      languages: [{ name: "Angielski", level: "B2" }, { name: "Polski" }],
    };
    const cv = normalizeCreatorCv(fields);

    // When
    const result = buildCvMarkdown(cv);

    // Then
    expect(result).toContain("### Informatyka, Uczelnia");
    expect(result).toContain("- Angielski – B2\n- Polski");
  });
});
