import { HttpError } from "../errors/HttpError.js";
import {
  CV_ANALYSIS_SYSTEM_PROMPT,
  buildCvAnalysisUserMessage,
} from "./ai/cv-analysis.prompt.js";
import { cvAnalysisSchema } from "./ai/cv-analysis.schema.js";
import { resolveLlm } from "./llm-key.service.js";
import { detectSkills, findSkill } from "./skills/skill-detector.service.js";

const MAX_AI_CHARS = 10_000;
const MAX_INPUT_CHARS = 50_000;

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

export async function analyzeCv(text, { userId }) {
  if (typeof text !== "string" || !text.trim()) {
    throw new HttpError(400, "CV_TEXT_MISSING");
  }
  if (text.length > MAX_INPUT_CHARS) {
    throw new HttpError(413, "CV_TEXT_TOO_LONG");
  }

  const truncated = text.length > MAX_AI_CHARS;
  const cvText = truncated ? text.slice(0, MAX_AI_CHARS) : text;

  const detected = detectSkills(text);

  const llm = await resolveLlm(userId);

  const raw = await llm.completeJson({
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
    throw new HttpError(502, "AI_EMPTY_RESPONSE");
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
    truncated,
    model: llm.model,
  };
}
