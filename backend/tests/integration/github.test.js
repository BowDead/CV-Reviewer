import { describe, expect, test } from "vitest";
import {
  createCandidateWithKey,
  CV_TEXT,
  modelAnswer,
} from "../helpers/data.js";
import { selectRows } from "../helpers/database.js";
import { stubGithub, stubGithubLimit, stubGroq } from "../helpers/network.js";

const LOGIN = "anna-dev";

function repository(id, name, changes = {}) {
  return {
    details: {
      id,
      name,
      description: `Projekt ${LOGIN}`,
      html_url: `https://github.com/${LOGIN}/${name}`,
      topics: ["docker"],
      fork: false,
      size: 10,
      pushed_at: "2026-05-01T10:00:00Z",
      ...changes,
    },
    languages: { JavaScript: 3000, HTML: 1000 },
    readme: `# Sklep\nAutor: ${LOGIN}`,
  };
}

function review(changes = {}) {
  return {
    repositories: [
      {
        id: "r1",
        summary: "Sklep internetowy.",
        falsePositives: [],
        additional: [],
        ...changes,
      },
    ],
  };
}

async function createCandidateWithGithub(
  repositories = [repository(1, "sklep")],
  answer = review(),
) {
  const candidate = await createCandidateWithKey();
  const requests = stubGithub(LOGIN, repositories, answer);
  await candidate.api
    .put("/api/github/account")
    .send({ login: LOGIN })
    .expect(200);
  return { ...candidate, requests };
}

function analyze(candidate) {
  return candidate.api.post("/api/github/repositories/analyze");
}

function findGroqRequest(requests) {
  return requests.find((request) => request.host === "api.groq.com");
}

describe("GitHub account", () => {
  test("given a GitHub profile URL when PUT /api/github/account then the login is returned and stored encrypted", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    stubGithub(LOGIN, [], {});

    // When
    const response = await candidate.api
      .put("/api/github/account")
      .send({ login: `https://github.com/${LOGIN}/` });

    // Then
    expect(response.body).toEqual({ login: LOGIN });
    const [row] = await selectRows("SELECT github_login_enc FROM users");
    expect(row.github_login_enc.includes(LOGIN)).toBe(false);
  });

  test("given a login missing on GitHub when PUT /api/github/account then 404 GITHUB_USER_NOT_FOUND is returned", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    stubGithub(LOGIN, [], {});

    // When
    const response = await candidate.api
      .put("/api/github/account")
      .send({ login: "nie-ma-takiego" });

    // Then
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("GITHUB_USER_NOT_FOUND");
  });

  test("given no connected GitHub account when POST /api/github/repositories/analyze then 409 GITHUB_ACCOUNT_REQUIRED is returned", async () => {
    // Given
    const candidate = await createCandidateWithKey();

    // When
    const response = await candidate.api.post(
      "/api/github/repositories/analyze",
    );

    // Then
    expect(response.status).toBe(409);
    expect(response.body.error).toBe("GITHUB_ACCOUNT_REQUIRED");
  });
});

describe("repository analysis", () => {
  test("given skills from the system and the model when POST /api/github/repositories/analyze then the skills from both are combined", async () => {
    // Given
    const candidate = await createCandidateWithGithub(
      undefined,
      review({ falsePositives: ["HTML"], additional: ["React"] }),
    );

    // When
    const response = await candidate.api.post(
      "/api/github/repositories/analyze",
    );

    // Then
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ analyzed: 1, failed: 0 });
    const [result] = response.body.repositories;
    expect(result).toMatchObject({
      name: "sklep",
      status: "done",
      summary: "Sklep internetowy.",
    });
    expect(result.skills.map(({ name }) => name).sort()).toEqual([
      "Docker",
      "JavaScript",
      "React",
    ]);
  });

  test("given a README with the login when POST /api/github/repositories/analyze then the model gets no login and temperature 0", async () => {
    // Given
    const candidate = await createCandidateWithGithub();

    // When
    await candidate.api.post("/api/github/repositories/analyze").expect(200);

    // Then
    const { body } = findGroqRequest(candidate.requests);
    expect(body.temperature).toBe(0);
    expect(body.messages[1].content).toContain("Autor: [LOGIN]");
    expect(body.messages[1].content).not.toContain(LOGIN);
  });

  test("given forks and empty repositories when POST /api/github/repositories/analyze then those repositories are skipped", async () => {
    // Given
    const candidate = await createCandidateWithGithub([
      repository(1, "sklep"),
      repository(2, "cudzy-projekt", { fork: true }),
      repository(3, "puste", { size: 0 }),
    ]);

    // When
    const response = await candidate.api.post(
      "/api/github/repositories/analyze",
    );

    // Then
    expect(response.body.repositories.map(({ name }) => name)).toEqual([
      "sklep",
    ]);
  });

  test("given unchanged repositories when POST /api/github/repositories/analyze again then those repositories are not sent to the model", async () => {
    // Given
    const candidate = await createCandidateWithGithub();
    await analyze(candidate).expect(200);
    const requests = stubGithub(LOGIN, [repository(1, "sklep")], review());

    // When
    const response = await candidate.api.post(
      "/api/github/repositories/analyze",
    );

    // Then
    expect(response.body).toMatchObject({ analyzed: 0, unchanged: 1 });
    expect(findGroqRequest(requests)).toBeUndefined();
  });

  test("given a repository removed from GitHub when POST /api/github/repositories/analyze again then the repository is removed", async () => {
    // Given
    const candidate = await createCandidateWithGithub();
    await analyze(candidate).expect(200);
    stubGithub(LOGIN, [repository(2, "nowe")], review());

    // When
    const response = await candidate.api.post(
      "/api/github/repositories/analyze",
    );

    // Then
    expect(response.body.repositories.map(({ name }) => name)).toEqual([
      "nowe",
    ]);
  });

  test("given an exhausted GitHub rate limit when POST /api/github/repositories/analyze then 429 GITHUB_RATE_LIMIT with the wait time is returned", async () => {
    // Given
    const candidate = await createCandidateWithGithub();
    stubGithubLimit(Date.now() + 5 * 60_000);

    // When
    const response = await candidate.api.post(
      "/api/github/repositories/analyze",
    );

    // Then
    expect(response.status).toBe(429);
    expect(response.body.error).toBe("GITHUB_RATE_LIMIT");
    expect(response.body.params.minutes).toBeGreaterThanOrEqual(5);
  });
});

describe("repositories in CV analysis", () => {
  test("given analyzed repositories when POST /api/cv/analyze then the repositories are sent only with useGithub and without the login", async () => {
    // Given
    const candidate = await createCandidateWithGithub();
    await analyze(candidate).expect(200);
    const requests = stubGroq(modelAnswer());
    const path = "/api/cv/analyze";

    // When
    await candidate.api.post(path).send({ text: CV_TEXT }).expect(200);
    await candidate.api
      .post(path)
      .send({ text: CV_TEXT, useGithub: true })
      .expect(200);

    // Then
    const [without, withGithub] = requests.map(
      (request) => request.body.messages[1].content,
    );
    expect(without).not.toContain("<github>");
    expect(withGithub).toContain("<github>\n- sklep: Sklep internetowy.");
    expect(withGithub).not.toContain(LOGIN);
  });
});
