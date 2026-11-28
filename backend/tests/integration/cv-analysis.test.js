import { describe, expect, test } from "vitest";
import { createAccount } from "../helpers/accounts.js";
import {
  createCandidateWithKey,
  CV_TEXT,
  llmKey,
  modelAnswer,
} from "../helpers/data.js";
import { selectRows } from "../helpers/database.js";
import { stubGroq, stubGroqError } from "../helpers/network.js";

const PDF = Buffer.from(
  [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300]",
    "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    "4 0 obj << /Length 47 >> stream",
    "BT /F1 12 Tf 20 200 Td (Frontend Developer) Tj ET",
    "endstream endobj",
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "trailer << /Root 1 0 R >>",
    "%%EOF",
  ].join("\n"),
);

describe("file upload", () => {
  // Accepted files
  test("given a valid PDF file when POST /api/cv/parse then the text of the PDF is returned", async () => {
    // Given
    const { api } = await createAccount("candidate");

    // When
    const response = await api
      .post("/api/cv/parse")
      .attach("file", PDF, "cv.pdf");

    // Then
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      kind: "pdf",
      text: "Frontend Developer",
      pageCount: 1,
    });
  });

  // Rejected files
  test("given a text file named cv.pdf when POST /api/cv/parse then 400 FILE_NOT_PDF is returned", async () => {
    // Given
    const fileName = "cv.pdf";
    const status = 400;
    const code = "FILE_NOT_PDF";
    const { api } = await createAccount("candidate");

    // When
    const response = await api
      .post("/api/cv/parse")
      .attach("file", Buffer.from("tekst"), fileName);

    // Then
    expect(response.status).toBe(status);
    expect(response.body.error).toBe(code);
  });

  test("given an unsupported file format when POST /api/cv/parse then 415 FILE_UNSUPPORTED is returned", async () => {
    // Given
    const fileName = "cv.txt";
    const status = 415;
    const code = "FILE_UNSUPPORTED";
    const { api } = await createAccount("candidate");

    // When
    const response = await api
      .post("/api/cv/parse")
      .attach("file", Buffer.from("tekst"), fileName);

    // Then
    expect(response.status).toBe(status);
    expect(response.body.error).toBe(code);
  });

  test("given a file over 10 MB when POST /api/cv/parse then 413 FILE_TOO_LARGE is returned", async () => {
    // Given
    const { api } = await createAccount("candidate");

    // When
    const response = await api
      .post("/api/cv/parse")
      .attach("file", Buffer.alloc(10 * 1024 * 1024 + 1), "cv.pdf");

    // Then
    expect(response.status).toBe(413);
    expect(response.body.error).toBe("FILE_TOO_LARGE");
  });
});

describe("model key", () => {
  test("given a valid key when POST /api/llm-keys then the key is stored encrypted and not returned", async () => {
    // Given
    const { api } = await createAccount("candidate");
    stubGroq();

    // When
    const response = await api.post("/api/llm-keys").send(llmKey());

    // Then
    expect(response.status).toBe(201);
    expect(JSON.stringify(response.body)).not.toContain(llmKey().apiKey);
    const [row] = await selectRows("SELECT api_key_enc FROM llm_keys");
    expect(row.api_key_enc.includes(llmKey().apiKey)).toBe(false);
  });

  test("given a key rejected by the provider when POST /api/llm-keys then 422 AI_KEY_INVALID is returned and the key is not stored", async () => {
    // Given
    const { api } = await createAccount("candidate");
    stubGroqError(401);

    // When
    const response = await api.post("/api/llm-keys").send(llmKey());

    // Then
    expect(response.status).toBe(422);
    expect(response.body.error).toBe("AI_KEY_INVALID");
    expect(await selectRows("SELECT id FROM llm_keys")).toHaveLength(0);
  });

  test("given no saved key when POST /api/cv/analyze then 409 LLM_KEY_REQUIRED is returned", async () => {
    // Given
    const candidate = await createAccount("candidate");

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    expect(response.status).toBe(409);
    expect(response.body.error).toBe("LLM_KEY_REQUIRED");
  });
});

describe("CV analysis", () => {
  test("given a valid model answer when POST /api/cv/analyze then the analysis with the system score is returned and saved", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    stubGroq(modelAnswer());

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    expect(response.status).toBe(200);
    expect(response.body.skills.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["React", "TypeScript", "SQL", "Git"]),
    );
    expect(response.body.analysis.overallScore).toBe(6.3);
    const history = await candidate.api.get("/api/analyses");
    expect(history.body.analyses).toEqual([
      expect.objectContaining({
        id: response.body.analysisId,
        overallScore: 6.3,
        seniority: "Junior",
      }),
    ]);
  });

  test("given a saved key when POST /api/cv/analyze then the user key, temperature 0 and a fixed seed are sent to the model", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    const requests = stubGroq(modelAnswer());

    // When
    await candidate.api.post("/api/cv/analyze").send({ text: CV_TEXT });

    // Then
    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get("authorization")).toBe(
      `Bearer ${llmKey().apiKey}`,
    );
    expect(requests[0].body).toMatchObject({
      model: "model-testowy",
      temperature: 0,
      seed: 7,
      response_format: { type: "json_object" },
    });
  });

  test("given a CV when POST /api/cv/analyze then the CV text and the detected skills are sent to the model", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    const requests = stubGroq(modelAnswer());

    // When
    await candidate.api.post("/api/cv/analyze").send({ text: CV_TEXT });

    // Then
    const message = requests[0].body.messages[1].content;
    expect(message).toContain(CV_TEXT);
    expect(message).toMatch(/<wykryte>\n.*React.*\n<\/wykryte>/);
  });

  test("given rewrites of sentences not in the CV when POST /api/cv/analyze then those rewrites are removed", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    const real = { original: "Frontend Developer", improved: "A", reason: "B" };
    const invented = { original: "Kierowanie zespołem", improved: "C" };
    stubGroq(modelAnswer({ rewrites: [real, invented] }));

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    expect(response.body.analysis.rewrites).toEqual([real]);
  });

  test("given a skill review from the model when POST /api/cv/analyze then false positives are removed and missed skills are added", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    stubGroq(
      modelAnswer({
        skillReview: { falsePositives: ["SQL"], additional: ["Docker"] },
      }),
    );

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    const names = response.body.skills.map((skill) => skill.name);
    expect(names).not.toContain("SQL");
    expect(response.body.skills).toContainEqual(
      expect.objectContaining({ name: "Docker", source: "llm" }),
    );
  });

  test("given an unknown skill from the model when POST /api/cv/analyze then the skill is stored as pending in the dictionary", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    stubGroq(
      modelAnswer({ skillReview: { falsePositives: [], additional: ["Elm"] } }),
    );

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    expect(response.body.unknownSkills).toEqual(["Elm"]);
    const rows = await selectRows(
      "SELECT status FROM skill_dict WHERE name = 'Elm'",
    );
    expect(rows).toEqual([{ status: "pending" }]);
  });
});

describe("model errors", () => {
  test("given invalid JSON from the model when POST /api/cv/analyze then the model request is retried", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    const requests = stubGroq("{niepełny", modelAnswer());

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    expect(response.status).toBe(200);
    expect(requests).toHaveLength(2);
  });

  test("given an incomplete model answer when POST /api/cv/analyze then the model request is retried with another seed", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    const requests = stubGroq(modelAnswer({ summary: "" }), modelAnswer());

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    expect(response.status).toBe(200);
    expect(requests.map((request) => request.body.seed)).toEqual([7, 8]);
  });

  test("given two incomplete model answers when POST /api/cv/analyze then 502 AI_EMPTY_RESPONSE is returned and no analysis is saved", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    stubGroq({});

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    expect(response.status).toBe(502);
    expect(response.body.error).toBe("AI_EMPTY_RESPONSE");
    expect(await selectRows("SELECT id FROM analyses")).toHaveLength(0);
  });

  test("given a key that stopped working when POST /api/cv/analyze then 422 AI_KEY_INVALID is returned", async () => {
    // Given
    const candidate = await createCandidateWithKey();
    stubGroqError(401);

    // When
    const response = await candidate.api
      .post("/api/cv/analyze")
      .send({ text: CV_TEXT });

    // Then
    expect(response.status).toBe(422);
    expect(response.body.error).toBe("AI_KEY_INVALID");
  });
});
