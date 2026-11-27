import { describe, expect, test } from "vitest";
import {
  matchOffer,
  rankOffers,
} from "../../src/services/offers/offer-matching.service.js";

function offer(requiredSkills, niceToHaveSkills = [], extra = {}) {
  return {
    requiredSkills,
    niceToHaveSkills,
    updatedAt: "2026-11-01",
    ...extra,
  };
}

describe("offer matching", () => {
  // Match percentage
  test("given all required skills when matchOffer then the score is 100", () => {
    // Given
    const score = 100;
    const required = ["React", "SQL"];
    const niceToHave = [];
    const userSkills = ["react", "sql"];
    const target = offer(required, niceToHave);

    // When
    const result = matchOffer(target, new Set(userSkills));

    // Then
    expect(result.score).toBe(score);
  });

  test("given half of required skills when matchOffer then the score is 50", () => {
    // Given
    const score = 50;
    const required = ["React", "SQL"];
    const niceToHave = [];
    const userSkills = ["react"];
    const target = offer(required, niceToHave);

    // When
    const result = matchOffer(target, new Set(userSkills));

    // Then
    expect(result.score).toBe(score);
  });

  test("given one of three required skills when matchOffer then the score is 33", () => {
    // Given
    const score = 33;
    const required = ["React", "SQL", "Git"];
    const niceToHave = [];
    const userSkills = ["git"];
    const target = offer(required, niceToHave);

    // When
    const result = matchOffer(target, new Set(userSkills));

    // Then
    expect(result.score).toBe(score);
  });

  test("given no common skills when matchOffer then the score is 0", () => {
    // Given
    const score = 0;
    const required = ["React"];
    const niceToHave = [];
    const userSkills = ["java"];
    const target = offer(required, niceToHave);

    // When
    const result = matchOffer(target, new Set(userSkills));

    // Then
    expect(result.score).toBe(score);
  });

  test("given half of required and all nice-to-have skills when matchOffer then the score is 60", () => {
    // Given
    const score = 60;
    const required = ["React", "SQL"];
    const niceToHave = ["Git"];
    const userSkills = ["react", "git"];
    const target = offer(required, niceToHave);

    // When
    const result = matchOffer(target, new Set(userSkills));

    // Then
    expect(result.score).toBe(score);
  });

  test("given all required and all nice-to-have skills when matchOffer then the score is capped at 100", () => {
    // Given
    const score = 100;
    const required = ["React"];
    const niceToHave = ["Git"];
    const userSkills = ["react", "git"];
    const target = offer(required, niceToHave);

    // When
    const result = matchOffer(target, new Set(userSkills));

    // Then
    expect(result.score).toBe(score);
  });

  test("given an offer with only nice-to-have skills, all matched, when matchOffer then the score is 10", () => {
    // Given
    const score = 10;
    const required = [];
    const niceToHave = ["Git"];
    const userSkills = ["git"];
    const target = offer(required, niceToHave);

    // When
    const result = matchOffer(target, new Set(userSkills));

    // Then
    expect(result.score).toBe(score);
  });

  // Matched and missing skills
  test("given partly matching skills when matchOffer then matched and missing skills are listed", () => {
    // Given
    const target = offer(["React", "SQL"], ["Git", "Docker"]);
    const userSkills = new Set(["react", "git"]);

    // When
    const result = matchOffer(target, userSkills);

    // Then
    expect(result.matched).toEqual(["React", "Git"]);
    expect(result.missing).toEqual(["SQL"]);
  });
});

describe("offer ranking", () => {
  const userSkills = new Set(["react"]);

  function titles(offers) {
    return offers.map((item) => item.title);
  }

  test("given offers with different scores when rankOffers then the best come first and zero scores are skipped", () => {
    // Given
    const half = offer(["React", "SQL"], [], { title: "połowa" });
    const full = offer(["React"], [], { title: "całość" });
    const none = offer(["Java"], [], { title: "nic" });

    // When
    const ranked = rankOffers([half, none, full], userSkills, 10);

    // Then
    expect(titles(ranked)).toEqual(["całość", "połowa"]);
  });

  test("given equal scores when rankOffers then the newer offer comes first", () => {
    // Given
    const older = offer(["React"], [], {
      title: "starsza",
      updatedAt: "2026-11-01",
    });
    const newer = offer(["React"], [], {
      title: "nowsza",
      updatedAt: "2026-11-10",
    });

    // When
    const ranked = rankOffers([older, newer], userSkills, 10);

    // Then
    expect(titles(ranked)).toEqual(["nowsza", "starsza"]);
  });

  test("given more offers than the limit when rankOffers then only as many offers as the limit are returned", () => {
    // Given
    const offers = Array.from({ length: 5 }, () => offer(["React"]));

    // When
    const result = rankOffers(offers, userSkills, 3);

    // Then
    expect(result).toHaveLength(3);
  });
});
