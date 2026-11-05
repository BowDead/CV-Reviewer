import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import { anonymize } from "./anonymizer.service.js";
import { completeJson } from "./ai/groq.client.js";
import {
  CV_ANALYSIS_SYSTEM_PROMPT,
  buildCvAnalysisUserMessage,
} from "./ai/cv-analysis.prompt.js";
import { cvAnalysisSchema } from "./ai/cv-analysis.schema.js";
import { detectSkills, findSkill } from "./skills/skill-detector.service.js";

const MAX_AI_CHARS = 14_000;
const MAX_INPUT_CHARS = 50_000;

function resolveGroqApiKey({ userApiKey } = {}) {
  return userApiKey || env.groqApiKey;
}

function mergeSkills(detected, review) {
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
    const skill = findSkill(name);
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

export async function analyzeCv(text, options = {}) {
  if (typeof text !== "string" || !text.trim()) {
    throw new HttpError(400, "Brak tekstu CV do analizy.");
  }
  if (text.length > MAX_INPUT_CHARS) {
    throw new HttpError(413, "Tekst CV jest za długi.");
  }

  const anonymized = anonymize(text);
  const truncated = anonymized.text.length > MAX_AI_CHARS;
  const cvText = truncated
    ? anonymized.text.slice(0, MAX_AI_CHARS)
    : anonymized.text;

  const raw = await completeJson({
    apiKey: resolveGroqApiKey(options),
    system: CV_ANALYSIS_SYSTEM_PROMPT,
    user: buildCvAnalysisUserMessage(
      cvText,
      detected.map((skill) => skill.name),
    ),
  });

  const parsed = cvAnalysisSchema.safeParse(raw);
  if (
    !parsed.success ||
    (parsed.data.overallScore === null && !parsed.data.summary)
  ) {
    throw new HttpError(
      502,
      "Model AI zwrócił odpowiedź bez oceny. Spróbuj ponownie.",
    );
  }

  const { skillReview, ...analysis } = parsed.data;
  const { known, unknown } = mergeSkills(detected, skillReview);
  analysis.profile = {
    ...analysis.profile,
    skills: groupByCategory(known, unknown),
  };

  return {
    analysis,
    skills: known.map(({ skill, source }) => ({
      name: skill.name,
      category: skill.category,
      source,
    })),
    unknownSkills: unknown,
    anonymization: anonymized.counts,
    truncated,
    model: env.groqModel,
  };
}
