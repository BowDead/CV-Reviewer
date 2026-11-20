import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import { setPositionBlocked } from "../models/position.model.js";
import {
  findDictionarySkill,
  insertDictionarySkill,
  listDictionarySkills,
  updateDictionarySkill,
} from "../models/skill.model.js";
import { listUsers, setUserBlocked } from "../models/user.model.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import { resetSkillDetector } from "./skills/skill-dictionary.service.js";

const UNIQUE_VIOLATION = "23505";
const ROLES = ["candidate", "employer", "admin"];
const SKILL_STATUSES = ["approved", "pending", "rejected"];

const booleanQuery = z
  .enum(["true", "false"], "INVALID_INPUT")
  .optional()
  .transform((value) => (value === undefined ? null : value === "true"));

function optionalQuery(max) {
  return z
    .string("INVALID_INPUT")
    .trim()
    .max(max, "INVALID_INPUT")
    .optional()
    .transform((value) => value || null);
}

const userFiltersSchema = z.object({
  email: optionalQuery(254),
  role: z
    .enum(ROLES, "INVALID_INPUT")
    .or(z.literal(""))
    .optional()
    .transform((value) => value || null),
  blocked: booleanQuery,
});

const blockSchema = z.object({ blocked: z.boolean("INVALID_INPUT") });

const skillFiltersSchema = z.object({
  status: z
    .enum(SKILL_STATUSES, "INVALID_INPUT")
    .or(z.literal(""))
    .optional()
    .transform((value) => value || null),
  q: optionalQuery(100),
  category: optionalQuery(50),
});

function optionalText(max, code) {
  return z
    .string(code)
    .trim()
    .max(max, code)
    .nullish()
    .transform((value) => value || null);
}

const skillFields = {
  name: z
    .string("SKILL_NAME_REQUIRED")
    .trim()
    .min(1, "SKILL_NAME_REQUIRED")
    .max(100, "SKILL_NAME_TOO_LONG"),
  category: optionalText(50, "SKILL_CATEGORY_TOO_LONG"),
  githubLanguage: optionalText(50, "SKILL_LANGUAGE_TOO_LONG"),
  aliases: z
    .array(
      z.string("SKILL_ALIAS_INVALID").trim().max(100, "SKILL_ALIAS_INVALID"),
      "SKILL_ALIAS_INVALID",
    )
    .max(20, "SKILL_ALIAS_INVALID")
    .transform((aliases) => [...new Set(aliases.filter(Boolean))]),
  caseSensitive: z.boolean("INVALID_INPUT"),
};

const newSkillSchema = z.object({
  ...skillFields,
  aliases: skillFields.aliases.default([]),
  caseSensitive: skillFields.caseSensitive.default(false),
});

const skillPatchSchema = z
  .object({
    ...skillFields,
    status: z.enum(SKILL_STATUSES, "INVALID_INPUT"),
  })
  .partial();

function parseSkillId(value) {
  const skillId = Number(value);
  if (!Number.isInteger(skillId) || skillId <= 0) {
    throw new HttpError(404, "SKILL_NOT_FOUND");
  }
  return skillId;
}

async function saveSkill(write) {
  try {
    const skill = await write();
    resetSkillDetector();
    return skill;
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, "SKILL_EXISTS");
    }
    throw err;
  }
}

export function getUsers(input) {
  return listUsers(parseInput(userFiltersSchema, input));
}

export async function blockUser(adminId, userId, input) {
  parseId(userId, "USER_NOT_FOUND");
  const { blocked } = parseInput(blockSchema, input);
  if (userId === adminId) {
    throw new HttpError(409, "CANNOT_BLOCK_SELF");
  }
  const user = await setUserBlocked(userId, blocked);
  if (!user) {
    throw new HttpError(404, "USER_NOT_FOUND");
  }
  return user;
}

export async function blockPosition(positionId, input) {
  parseId(positionId, "POSITION_NOT_FOUND");
  const { blocked } = parseInput(blockSchema, input);
  const position = await setPositionBlocked(positionId, blocked);
  if (!position) {
    throw new HttpError(404, "POSITION_NOT_FOUND");
  }
  return position;
}

export function getDictionary(input) {
  const { status, q, category } = parseInput(skillFiltersSchema, input);
  return listDictionarySkills({ status, search: q, category });
}

export function addSkill(input) {
  const skill = parseInput(newSkillSchema, input);
  return saveSkill(() => insertDictionarySkill(skill));
}

export async function editSkill(skillIdParam, input) {
  const skillId = parseSkillId(skillIdParam);
  const current = await findDictionarySkill(skillId);
  if (!current) {
    throw new HttpError(404, "SKILL_NOT_FOUND");
  }
  const changes = parseInput(skillPatchSchema, input);
  const next = { ...current, ...changes };
  return saveSkill(() => updateDictionarySkill(skillId, next));
}
