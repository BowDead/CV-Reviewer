import { describe, expect, test } from "vitest";
import {
  containsQuote,
  keepRewritesFromCv,
  scoreCv,
} from "../../src/services/cv-scoring.service.js";

const QUOTE = "Skrócenie czasu odpowiedzi o 40%";

function words(count) {
  return Array.from({ length: count }, () => "słowo").join(" ");
}

function skills(count) {
  return Array.from({ length: count }, (_, index) => `Umiejętność ${index}`);
}

function answer(id, level, evidence = "") {
  return { id, level, evidence, comment: "" };
}

function findCategory(result, name) {
  return result.categories.find((category) => category.name === name);
}

function findCriterion(result, id) {
  return result.categories
    .flatMap((category) => category.criteria)
    .find((criterion) => criterion.id === id);
}

describe("criteria checked by the system", () => {
  // CV length thresholds
  test("given 149 words when scoreCv then length level is 0", () => {
    // Given
    const count = 149;
    const level = 0;
    const text = words(count);

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "length").level).toBe(level);
  });

  test("given 150 words when scoreCv then length level is 1", () => {
    // Given
    const count = 150;
    const level = 1;
    const text = words(count);

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "length").level).toBe(level);
  });

  test("given 249 words when scoreCv then length level is 1", () => {
    // Given
    const count = 249;
    const level = 1;
    const text = words(count);

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "length").level).toBe(level);
  });

  test("given 250 words when scoreCv then length level is 2", () => {
    // Given
    const count = 250;
    const level = 2;
    const text = words(count);

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "length").level).toBe(level);
  });

  test("given 1200 words when scoreCv then length level is 2", () => {
    // Given
    const count = 1200;
    const level = 2;
    const text = words(count);

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "length").level).toBe(level);
  });

  test("given 1201 words when scoreCv then length level is 1", () => {
    // Given
    const count = 1201;
    const level = 1;
    const text = words(count);

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "length").level).toBe(level);
  });

  test("given 1800 words when scoreCv then length level is 1", () => {
    // Given
    const count = 1800;
    const level = 1;
    const text = words(count);

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "length").level).toBe(level);
  });

  test("given 1801 words when scoreCv then length level is 0", () => {
    // Given
    const count = 1801;
    const level = 0;
    const text = words(count);

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "length").level).toBe(level);
  });

  // Skills count thresholds
  test("given 3 skills when scoreCv then skills count level is 0", () => {
    // Given
    const count = 3;
    const level = 0;
    const found = skills(count);

    // When
    const result = scoreCv("CV", [], found);

    // Then
    expect(findCriterion(result, "skillsCount").level).toBe(level);
  });

  test("given 4 skills when scoreCv then skills count level is 1", () => {
    // Given
    const count = 4;
    const level = 1;
    const found = skills(count);

    // When
    const result = scoreCv("CV", [], found);

    // Then
    expect(findCriterion(result, "skillsCount").level).toBe(level);
  });

  test("given 7 skills when scoreCv then skills count level is 1", () => {
    // Given
    const count = 7;
    const level = 1;
    const found = skills(count);

    // When
    const result = scoreCv("CV", [], found);

    // Then
    expect(findCriterion(result, "skillsCount").level).toBe(level);
  });

  test("given 8 skills when scoreCv then skills count level is 2", () => {
    // Given
    const count = 8;
    const level = 2;
    const found = skills(count);

    // When
    const result = scoreCv("CV", [], found);

    // Then
    expect(findCriterion(result, "skillsCount").level).toBe(level);
  });

  // Contact data
  test("given no contact data when scoreCv then contact level is 0", () => {
    // Given
    const level = 0;
    const text = "CV";

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "contact").level).toBe(level);
  });

  test("given only an email when scoreCv then contact level is 1", () => {
    // Given
    const level = 1;
    const text = "jan@example.com";

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "contact").level).toBe(level);
  });

  test("given an email and a phone when scoreCv then contact level is 2", () => {
    // Given
    const level = 2;
    const text = "jan@example.com 600 700 800";

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "contact").level).toBe(level);
  });

  test("given anonymized contact data when scoreCv then contact level is 2", () => {
    // Given
    const level = 2;
    const text = "[EMAIL] [TELEFON]";

    // When
    const result = scoreCv(text, [], []);

    // Then
    expect(findCriterion(result, "contact").level).toBe(level);
  });
});

describe("criteria rated by the model", () => {
  test("given a quote present in the CV when scoreCv then the level is kept", () => {
    // Given
    const answers = [answer("metrics", 2, QUOTE)];

    // When
    const result = scoreCv(QUOTE, answers, []);

    // Then
    expect(findCriterion(result, "metrics")).toMatchObject({
      level: 2,
      evidence: QUOTE,
    });
  });

  test("given a quote not in the CV when scoreCv then the level drops by 1 and the quote is removed", () => {
    // Given
    const invented = "Wzrost sprzedaży o 90%";
    const answers = [answer("metrics", 2, invented)];

    // When
    const result = scoreCv(QUOTE, answers, []);

    // Then
    expect(findCriterion(result, "metrics")).toMatchObject({
      level: 1,
      evidence: "",
    });
  });

  test("given a criterion without a required quote when scoreCv then the level is kept", () => {
    // Given
    const answers = [answer("correctness", 2)];

    // When
    const result = scoreCv(QUOTE, answers, []);

    // Then
    expect(findCriterion(result, "correctness").level).toBe(2);
  });

  test("given no model answer for a criterion when scoreCv then the criterion is not rated", () => {
    // Given
    const answers = [];

    // When
    const result = scoreCv(QUOTE, answers, []);

    // Then
    expect(findCriterion(result, "metrics").level).toBeNull();
  });
});

describe("final score", () => {
  test("given rated and unrated criteria when scoreCv then the category score uses only rated ones", () => {
    // Given
    const answers = [answer("consistency", 0), answer("correctness", 2)];

    // When
    const result = scoreCv("CV", answers, []);

    // Then
    expect(findCategory(result, "Język i styl").score).toBe(5);
  });

  test("given a category without rated criteria when scoreCv then the category has no score", () => {
    // Given
    const answers = [];

    // When
    const result = scoreCv("CV", answers, []);

    // Then
    expect(findCategory(result, "Doświadczenie").score).toBeNull();
  });

  test("given rated categories when scoreCv then the overall score is their average", () => {
    // Given
    const text = `jan@example.com 600 700 800 github.com/jan ${words(300)}`;
    const answers = [answer("correctness", 0)];

    // When
    const result = scoreCv(text, answers, skills(8));

    // Then
    expect(result.categories.map((category) => category.score)).toEqual([
      10,
      10,
      null,
      10,
      0,
    ]);
    expect(result.overallScore).toBe(7.5);
  });

  test("given the same data twice when scoreCv then the results are equal", () => {
    // Given
    const answers = [answer("metrics", 2, QUOTE)];

    // When
    const first = scoreCv(QUOTE, answers, skills(5));
    const second = scoreCv(QUOTE, answers, skills(5));

    // Then
    expect(second).toEqual(first);
  });
});

describe("quote checking", () => {
  // Quotes with formatting differences
  test("given a quote differing in letter case when containsQuote then the quote is found", () => {
    // Given
    const quote = "SKRÓCENIE CZASU odpowiedzi o 40%";
    const text = `- ${QUOTE}`;

    // When
    const result = containsQuote(text, quote);

    // Then
    expect(result).toBe(true);
  });

  test("given a quote differing in Markdown marks when containsQuote then the quote is found", () => {
    // Given
    const quote = "**Skrócenie czasu** odpowiedzi o 40%";
    const text = `- ${QUOTE}`;

    // When
    const result = containsQuote(text, quote);

    // Then
    expect(result).toBe(true);
  });

  test("given a quote differing in whitespace when containsQuote then the quote is found", () => {
    // Given
    const quote = "Skrócenie   czasu\nodpowiedzi o 40%";
    const text = `- ${QUOTE}`;

    // When
    const result = containsQuote(text, quote);

    // Then
    expect(result).toBe(true);
  });

  // Empty quote
  test("given an empty quote when containsQuote then the quote is not found", () => {
    // Given
    const quote = "  ";

    // When
    const result = containsQuote(QUOTE, quote);

    // Then
    expect(result).toBe(false);
  });

  // Rewrites
  test("given rewrites of sentences not in the CV when keepRewritesFromCv then those rewrites are removed", () => {
    // Given
    const fromCv = { original: QUOTE, improved: "A", reason: "B" };
    const invented = { original: "Kierowanie zespołem", improved: "C" };

    // When
    const result = keepRewritesFromCv([fromCv, invented], QUOTE);

    // Then
    expect(result).toEqual([fromCv]);
  });
});
