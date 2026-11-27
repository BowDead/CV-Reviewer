import { createAccount } from "./accounts.js";
import { blockNetwork, stubGroq } from "./network.js";

export const CV_TEXT = [
  "Anna Nowak",
  "anna@example.com, 600 700 800, github.com/anna",
  "Frontend Developer",
  "Wdrożenie panelu w React i TypeScript dla 200 klientów",
  "Umiejętności: React, TypeScript, SQL, Git",
].join("\n");

export function modelAnswer(changes = {}) {
  return {
    criteria: [
      {
        id: "metrics",
        level: 2,
        evidence: "Wdrożenie panelu w React i TypeScript dla 200 klientów",
        comment: "Podano liczbę klientów.",
      },
    ],
    seniority: "Junior",
    summary: "Frontend z doświadczeniem w React.",
    strengths: ["React"],
    weaknesses: [],
    missingSections: [],
    actionItems: ["Dodać sekcję projektów"],
    rewrites: [],
    suggestedRoles: ["Frontend Developer"],
    skillsToAdd: [],
    skillReview: { falsePositives: [], additional: [] },
    profile: { headline: "Frontend Developer", location: "Tarnów" },
    ...changes,
  };
}

export function llmKey() {
  return { provider: "groq", model: "model-testowy", apiKey: "gsk_test_123" };
}

export async function createCandidateWithKey() {
  const candidate = await createAccount("candidate");
  stubGroq();
  await candidate.api.post("/api/llm-keys").send(llmKey()).expect(201);
  blockNetwork();
  return candidate;
}

export async function saveCv(account, name = "CV frontend") {
  const response = await account.api
    .post("/api/cv/saved")
    .send({ name, content: CV_TEXT })
    .expect(201);
  return response.body.cv;
}

export async function createCandidateWithProfile({ published = true } = {}) {
  const candidate = await createCandidateWithKey();
  const cv = await saveCv(candidate);

  stubGroq(modelAnswer());
  const analysis = await candidate.api
    .post("/api/cv/analyze")
    .send({ text: CV_TEXT, cvId: cv.id })
    .expect(200);
  blockNetwork();

  const { analysisId } = analysis.body;
  await candidate.api.put("/api/profile").send({ analysisId }).expect(200);
  await candidate.api
    .put("/api/profile/publication")
    .send({ published })
    .expect(200);
  return { ...candidate, cvId: cv.id, analysisId };
}

export async function findSkillId(account, name) {
  const response = await account.api.get("/api/skills").expect(200);
  return response.body.skills.find((skill) => skill.name === name).id;
}

export async function createPosition(employer, skillNames = ["React"]) {
  const skills = [];
  for (const name of skillNames) {
    skills.push({ skillId: await findSkillId(employer, name) });
  }
  const response = await employer.api
    .post("/api/positions")
    .send({ title: "Frontend", description: "Praca z React", skills })
    .expect(201);
  return response.body;
}

export async function invite(employer, positionId, candidateId) {
  const response = await employer.api
    .post(`/api/positions/${positionId}/invitations`)
    .send({ candidateId, message: "Zapraszamy na rozmowę" })
    .expect(201);
  return response.body;
}

export async function createInvitation() {
  const candidate = await createCandidateWithProfile();
  const employer = await createAccount("employer");
  const position = await createPosition(employer);
  const invitation = await invite(employer, position.id, candidate.id);
  return { candidate, employer, position, invitation };
}
