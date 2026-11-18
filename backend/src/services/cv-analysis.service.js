import { HttpError } from "../errors/HttpError.js";
import {
  CV_ANALYSIS_SYSTEM_PROMPT,
  buildCvAnalysisUserMessage,
} from "./ai/cv-analysis.prompt.js";
import { cvAnalysisSchema } from "./ai/cv-analysis.schema.js";
import { keepRewritesFromCv, scoreCv } from "./cv-scoring.service.js";
import { getRepositoriesForCv } from "./github.service.js";
import { resolveLlm } from "./llm-key.service.js";
import {
  getSkillDetector,
  savePendingSkills,
} from "./skills/skill-dictionary.service.js";

const MAX_AI_CHARS = 10_000;
const MAX_INPUT_CHARS = 50_000;
const ANALYSIS_SEED = 7;
const MAX_ATTEMPTS = 2;

function mergeSkills(detected, review, detector) {
  const rejected = new Set(
    review.falsePositives.map((name) => name.toLowerCase()),
  );
  const known = new Map();
  for (const skill of detected) {
    if (!rejected.has(skill.name.toLowerCase())) {
      known.set(skill.name, { skill, source: "system" });
    }
  }

  const unknown = [];
  for (const name of review.additional) {
    const skill = detector.find(name);
    if (skill) {
      if (!known.has(skill.name))
        known.set(skill.name, { skill, source: "llm" });
    } else if (
      !unknown.some((item) => item.toLowerCase() === name.toLowerCase())
    ) {
      unknown.push(name);
    }
  }
  return { known: [...known.values()], unknown };
}

function groupByCategory(known, unknown) {
  const groups = new Map();
  for (const { skill } of known) {
    groups.set(skill.category, [
      ...(groups.get(skill.category) ?? []),
      skill.name,
    ]);
  }
  if (unknown.length > 0) {
    groups.set("Inne", unknown);
  }
  return [...groups].map(([category, items]) => ({ category, items }));
}

function isComplete(data) {
  return (
    data.criteria.length > 0 &&
    data.summary !== "" &&
    data.actionItems.length > 0
  );
}

async function askModel(llm, userMessage) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const raw = await llm.completeJson({
      system: CV_ANALYSIS_SYSTEM_PROMPT,
      user: userMessage,
      temperature: 0,
      seed: ANALYSIS_SEED + attempt,
    });
    const parsed = cvAnalysisSchema.safeParse(raw);
    if (parsed.success && isComplete(parsed.data)) {
      return parsed.data;
    }
    console.warn(
      "Niepełna odpowiedź modelu, próba",
      attempt + 1,
      Object.keys(raw ?? {}),
    );
  }
  throw new HttpError(502, "AI_EMPTY_RESPONSE");
}

export async function analyzeCv(text, { userId, useGithub = false }) {
  if (typeof text !== "string" || !text.trim()) {
    throw new HttpError(400, "CV_TEXT_MISSING");
  }
  if (text.length > MAX_INPUT_CHARS) {
    throw new HttpError(413, "CV_TEXT_TOO_LONG");
  }

  const truncated = text.length > MAX_AI_CHARS;
  const cvText = truncated ? text.slice(0, MAX_AI_CHARS) : text;

  const detector = await getSkillDetector();
  const detected = detector.detect(text);

  const llm = await resolveLlm(userId);
  const repositories = useGithub ? await getRepositoriesForCv(userId) : [];

  const data = await askModel(
    llm,
    buildCvAnalysisUserMessage(
      cvText,
      detected.map((skill) => skill.name),
      repositories,
    ),
  );

  const { skillReview, criteria, rewrites, ...analysis } = data;
  const { known, unknown } = mergeSkills(detected, skillReview, detector);
  await savePendingSkills(unknown);

  const skillNames = known.map(({ skill }) => skill.name);
  const { overallScore, categories } = scoreCv(text, criteria, skillNames);

  return {
    analysis: {
      ...analysis,
      overallScore,
      categories,
      rewrites: keepRewritesFromCv(rewrites, text),
      profile: {
        ...analysis.profile,
        skills: groupByCategory(known, unknown),
      },
    },
    skills: known.map(({ skill, source }) => ({
      name: skill.name,
      category: skill.category,
      source,
    })),
    unknownSkills: unknown,
    truncated,
    githubRepositories: repositories.length,
    model: llm.model,
  };
}
