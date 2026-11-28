import { describe, expect, test } from "vitest";
import { createAccount } from "../helpers/accounts.js";
import {
  createCandidateWithProfile,
  CV_TEXT,
  saveCv,
} from "../helpers/data.js";

describe("saved CVs", () => {
  // Saving, limit and deleting
  test("given a saved CV when GET /api/cv/saved/:id then the same content is returned", async () => {
    // Given
    const { api } = await createAccount("candidate");
    const cv = await saveCv({ api });

    // When
    const response = await api.get(`/api/cv/saved/${cv.id}`);

    // Then
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: "CV frontend",
      source: "upload",
      content: CV_TEXT,
      latestAnalysis: null,
    });
  });

  test("given 10 saved CVs when POST /api/cv/saved then 409 CV_LIMIT is returned", async () => {
    // Given
    const candidate = await createAccount("candidate");
    for (let number = 1; number <= 10; number++) {
      await saveCv(candidate, `CV ${number}`);
    }

    // When
    const response = await candidate.api
      .post("/api/cv/saved")
      .send({ name: "CV 11", content: CV_TEXT });

    // Then
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: "CV_LIMIT", params: { max: 10 } });
  });

  test("given a CV with an analysis when DELETE /api/cv/saved/:id then the analysis stays", async () => {
    // Given
    const candidate = await createCandidateWithProfile();

    // When
    await candidate.api.delete(`/api/cv/saved/${candidate.cvId}`).expect(204);

    // Then
    const response = await candidate.api.get("/api/analyses");
    expect(response.body.analyses).toHaveLength(1);
    expect(response.body.analyses[0].cvId).toBeNull();
  });

  // Missing or invalid CV id
  test("given a missing CV when GET /api/cv/saved/:id then 404 CV_NOT_FOUND is returned", async () => {
    // Given
    const id = "00000000-0000-4000-8000-000000000000";
    const { api } = await createAccount("candidate");

    // When
    const response = await api.get(`/api/cv/saved/${id}`);

    // Then
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("CV_NOT_FOUND");
  });

  test("given an invalid id when GET /api/cv/saved/:id then 404 CV_NOT_FOUND is returned", async () => {
    // Given
    const id = "abc";
    const { api } = await createAccount("candidate");

    // When
    const response = await api.get(`/api/cv/saved/${id}`);

    // Then
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("CV_NOT_FOUND");
  });
});

describe("CV creator", () => {
  // Valid creator data
  test("given valid creator data when POST /api/cv/saved/creator then the CV is stored as Markdown", async () => {
    // Given
    const { api } = await createAccount("candidate");

    // When
    const created = await api.post("/api/cv/saved/creator").send({
      name: "Z kreatora",
      fullName: "Anna Nowak",
      headline: "Tester",
      skills: ["SQL", "sql", "Git"],
    });

    // Then
    expect(created.status).toBe(201);
    expect(created.body.cv.source).toBe("creator");
    const saved = await api.get(`/api/cv/saved/${created.body.cv.id}`);
    expect(saved.body.content).toBe(
      "# Anna Nowak\n\n**Tester**\n\n## Umiejętności\n\nSQL, Git",
    );
  });

  // Invalid creator data
  test("given no headline when POST /api/cv/saved/creator then 400 CV_HEADLINE_REQUIRED is returned", async () => {
    // Given
    const body = { name: "CV" };
    const code = "CV_HEADLINE_REQUIRED";
    const { api } = await createAccount("candidate");

    // When
    const response = await api.post("/api/cv/saved/creator").send(body);

    // Then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(code);
  });

  test("given no name when POST /api/cv/saved/creator then 400 CV_NAME_REQUIRED is returned", async () => {
    // Given
    const body = { headline: "Tester" };
    const code = "CV_NAME_REQUIRED";
    const { api } = await createAccount("candidate");

    // When
    const response = await api.post("/api/cv/saved/creator").send(body);

    // Then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(code);
  });

  test("given a too long phone when POST /api/cv/saved/creator then 400 CV_FIELD_TOO_LONG is returned", async () => {
    // Given
    const body = { name: "CV", headline: "Tester", phone: "1".repeat(41) };
    const code = "CV_FIELD_TOO_LONG";
    const { api } = await createAccount("candidate");

    // When
    const response = await api.post("/api/cv/saved/creator").send(body);

    // Then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(code);
  });

  test("given too many skills when POST /api/cv/saved/creator then 400 CV_LIST_TOO_LONG is returned", async () => {
    // Given
    const body = {
      name: "CV",
      headline: "Tester",
      skills: Array(51).fill("SQL"),
    };
    const code = "CV_LIST_TOO_LONG";
    const { api } = await createAccount("candidate");

    // When
    const response = await api.post("/api/cv/saved/creator").send(body);

    // Then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(code);
  });
});
