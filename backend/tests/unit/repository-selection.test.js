import { describe, expect, test } from "vitest";
import {
  MAX_OFFER_REPOSITORIES,
  selectRepositories,
} from "../../src/services/offers/repository-selection.service.js";

const offer = {
  requiredSkills: ["React", "SQL"],
  niceToHaveSkills: ["Docker", "Git"],
};

function repository(name, skills, extra = {}) {
  return {
    id: name,
    name,
    url: `https://github.com/test/${name}`,
    status: "done",
    pushedAt: "2026-01-01T00:00:00Z",
    skills: skills.map((skill) => ({ name: skill })),
    ...extra,
  };
}

function names(repositories) {
  return repositories.map((item) => item.name);
}

describe("repository selection for an offer", () => {
  test("given required and nice-to-have skills when selectRepositories then required ones come first", () => {
    // Given
    const repositories = [
      repository("mile-widziane", ["Docker", "Git"]),
      repository("wymagane", ["React"]),
    ];

    // When
    const selected = selectRepositories(
      offer,
      repositories,
      MAX_OFFER_REPOSITORIES,
    );

    // Then
    expect(names(selected)).toEqual(["wymagane", "mile-widziane"]);
  });

  test("given the same number of required skills when selectRepositories then all matching skills decide", () => {
    // Given
    const repositories = [
      repository("jedna", ["React"]),
      repository("dwie", ["SQL", "Docker"]),
    ];

    // When
    const selected = selectRepositories(
      offer,
      repositories,
      MAX_OFFER_REPOSITORIES,
    );

    // Then
    expect(names(selected)).toEqual(["dwie", "jedna"]);
  });

  test("given a full tie when selectRepositories then the most recently pushed comes first", () => {
    // Given
    const repositories = [
      repository("starsze", ["React"]),
      repository("nowsze", ["React"], { pushedAt: "2026-06-01T00:00:00Z" }),
    ];

    // When
    const selected = selectRepositories(
      offer,
      repositories,
      MAX_OFFER_REPOSITORIES,
    );

    // Then
    expect(names(selected)).toEqual(["nowsze", "starsze"]);
  });

  test("given a repository without common skills when selectRepositories then the repository is skipped", () => {
    // Given
    const repositories = [
      repository("inne", ["Java"]),
      repository("pasujące", ["SQL"]),
    ];

    // When
    const selected = selectRepositories(
      offer,
      repositories,
      MAX_OFFER_REPOSITORIES,
    );

    // Then
    expect(names(selected)).toEqual(["pasujące"]);
  });

  test("given repositories not analyzed yet when selectRepositories then those repositories are skipped", () => {
    // Given
    const repositories = [
      repository("oczekujące", ["React"], { status: "pending" }),
      repository("nieudane", ["React"], { status: "failed" }),
      repository("gotowe", ["SQL"]),
    ];

    // When
    const selected = selectRepositories(
      offer,
      repositories,
      MAX_OFFER_REPOSITORIES,
    );

    // Then
    expect(names(selected)).toEqual(["gotowe"]);
  });

  test("given four matching repositories when selectRepositories then at most 3 are returned", () => {
    // Given
    const repositories = ["a", "b", "c", "d"].map((name) =>
      repository(name, ["React"]),
    );

    // When
    const result = selectRepositories(
      offer,
      repositories,
      MAX_OFFER_REPOSITORIES,
    );

    // Then
    expect(result).toHaveLength(3);
  });

  test("given a repository with extra skills when selectRepositories then only matching ones are listed, required first", () => {
    // Given
    const repositories = [repository("api", ["Docker", "Java", "react"])];

    // When
    const [result] = selectRepositories(
      offer,
      repositories,
      MAX_OFFER_REPOSITORIES,
    );

    // Then
    expect(result.matchedSkills).toEqual(["react", "Docker"]);
  });
});
