import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  deletePosition,
  findPosition,
  insertPosition,
  listPositions,
  updatePosition,
} from "../models/position.model.js";
import { countApprovedSkills } from "../models/skill.model.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import {
  POSITION_SKILLS_SYSTEM_PROMPT,
  buildPositionSkillsUserMessage,
} from "./ai/position-skills.prompt.js";
import { positionSkillsSchema } from "./ai/position-skills.schema.js";
import { resolveLlm } from "./llm-key.service.js";
import {
  getSkillDetector,
  savePendingSkills,
} from "./skills/skill-dictionary.service.js";

const MAX_TITLE = 150;
const MAX_DESCRIPTION = 4000;
const MAX_URL = 2048;
const MAX_SKILLS = 50;
const SUGGESTION_SEED = 7;

function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const titleSchema = z
  .string("POSITION_TITLE_REQUIRED")
  .trim()
  .min(1, "POSITION_TITLE_REQUIRED")
  .max(MAX_TITLE, "POSITION_TITLE_TOO_LONG");

const descriptionSchema = z
  .string("POSITION_DESCRIPTION_REQUIRED")
  .trim()
  .min(1, "POSITION_DESCRIPTION_REQUIRED")
  .max(MAX_DESCRIPTION, "POSITION_DESCRIPTION_TOO_LONG");

const positionSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  url: z
    .string("POSITION_URL_INVALID")
    .trim()
    .max(MAX_URL, "POSITION_URL_INVALID")
    .refine((value) => !value || isHttpUrl(value), "POSITION_URL_INVALID")
    .nullish()
    .transform((value) => value || null),
  skills: z
    .array(
      z.object({
        skillId: z.int("SKILL_NOT_FOUND").positive("SKILL_NOT_FOUND"),
        isRequired: z.boolean("INVALID_INPUT").default(true),
      }),
      "INVALID_INPUT",
    )
    .max(MAX_SKILLS, "POSITION_TOO_MANY_SKILLS")
    .default([]),
});

const suggestionSchema = z.object({
  title: z
    .string("INVALID_INPUT")
    .trim()
    .max(MAX_TITLE, "POSITION_TITLE_TOO_LONG")
    .default(""),
  description: descriptionSchema,
});

function uniqueSkills(skills) {
  const seen = new Set();
  return skills.filter((skill) => {
    if (seen.has(skill.skillId)) {
      return false;
    }
    seen.add(skill.skillId);
    return true;
  });
}

async function parsePosition(input) {
  const data = parseInput(positionSchema, input);
  const skills = uniqueSkills(data.skills);
  const ids = skills.map((skill) => skill.skillId);
  if ((await countApprovedSkills(ids)) !== ids.length) {
    throw new HttpError(400, "SKILL_NOT_FOUND");
  }
  return { ...data, skills };
}

async function requirePosition(employerId, positionId) {
  parseId(positionId, "POSITION_NOT_FOUND");
  const position = await findPosition(employerId, positionId);
  if (!position) {
    throw new HttpError(404, "POSITION_NOT_FOUND");
  }
  return position;
}

export function getPositions(employerId) {
  return listPositions(employerId);
}

export function getPosition(employerId, positionId) {
  return requirePosition(employerId, positionId);
}

export async function createPosition(employerId, input) {
  const data = await parsePosition(input);
  const positionId = await insertPosition(employerId, data);
  return requirePosition(employerId, positionId);
}

export async function editPosition(employerId, positionId, input) {
  await requirePosition(employerId, positionId);
  const data = await parsePosition(input);
  await updatePosition(employerId, positionId, data);
  return requirePosition(employerId, positionId);
}

export async function removePosition(employerId, positionId) {
  parseId(positionId, "POSITION_NOT_FOUND");
  if (!(await deletePosition(employerId, positionId))) {
    throw new HttpError(404, "POSITION_NOT_FOUND");
  }
}

function classifySkills(detected, review, detector) {
  const rejected = new Set(
    review.falsePositives.map((name) => name.toLowerCase()),
  );
  const picked = new Map();
  const unknown = [];

  function add(name, isRequired) {
    const skill = detector.find(name);
    if (!skill) {
      if (!unknown.some((item) => item.toLowerCase() === name.toLowerCase())) {
        unknown.push(name);
      }
      return;
    }
    if (!picked.has(skill.id)) {
      picked.set(skill.id, {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        isRequired,
      });
    }
  }

  review.required.forEach((name) => add(name, true));
  review.niceToHave.forEach((name) => add(name, false));
  for (const skill of detected) {
    if (!rejected.has(skill.name.toLowerCase())) {
      add(skill.name, true);
    }
  }
  return { skills: [...picked.values()].slice(0, MAX_SKILLS), unknown };
}

export async function suggestPositionSkills(userId, input) {
  const { title, description } = parseInput(suggestionSchema, input);
  const detector = await getSkillDetector();
  const detected = detector.detect(`${title}\n${description}`);

  const llm = await resolveLlm(userId);
  const raw = await llm.completeJson({
    system: POSITION_SKILLS_SYSTEM_PROMPT,
    user: buildPositionSkillsUserMessage(
      title,
      description,
      detected.map((skill) => skill.name),
    ),
    temperature: 0,
    seed: SUGGESTION_SEED,
  });

  const parsed = positionSkillsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new HttpError(502, "AI_EMPTY_RESPONSE");
  }
  const { skills, unknown } = classifySkills(detected, parsed.data, detector);
  await savePendingSkills(unknown);
  return { skills, unknownSkills: unknown };
}
