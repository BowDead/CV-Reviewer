import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  findProfile,
  replaceProfileSkills,
  saveProfileFromAnalysis,
  setProfilePublication,
  updateProfileFields,
} from "../models/profile.model.js";
import {
  countApprovedSkills,
  findApprovedSkillIdsByNames,
} from "../models/skill.model.js";
import { parseInput } from "../utils/parse-input.js";
import { getAnalysis } from "./analysis.service.js";
import { guessFullName } from "./anonymizer.service.js";
import { readSavedCvContent } from "./saved-cv.service.js";

const MAX_DISPLAY_NAME = 100;
const MAX_HEADLINE = 150;
const MAX_LOCATION = 100;
const MAX_SKILLS = 50;

const sourceSchema = z.object({
  analysisId: z.uuid("ANALYSIS_NOT_FOUND"),
});

function optionalText(max, code) {
  return z
    .string(code)
    .trim()
    .max(max, code)
    .transform((value) => value || null)
    .nullable()
    .optional();
}

const fieldsSchema = z.object({
  displayName: optionalText(MAX_DISPLAY_NAME, "PROFILE_NAME_TOO_LONG"),
  headline: optionalText(MAX_HEADLINE, "PROFILE_HEADLINE_TOO_LONG"),
  location: optionalText(MAX_LOCATION, "PROFILE_LOCATION_TOO_LONG"),
});

const skillsSchema = z.object({
  skillIds: z
    .array(
      z.int("SKILL_NOT_FOUND").positive("SKILL_NOT_FOUND"),
      "INVALID_INPUT",
    )
    .max(MAX_SKILLS, "PROFILE_TOO_MANY_SKILLS"),
});

const publicationSchema = z.object({
  published: z.boolean("INVALID_INPUT"),
});

function cut(value, max) {
  const text = (value ?? "").trim();
  return text ? text.slice(0, max) : null;
}

function keep(value, current) {
  return value === undefined ? current : value;
}

function nameFromCv(cvText, headline) {
  const name = cvText ? guessFullName(cvText) : null;
  if (!name || name.toLowerCase() === headline?.trim().toLowerCase()) {
    return null;
  }
  return cut(name, MAX_DISPLAY_NAME);
}

async function requireProfile(userId) {
  const profile = await findProfile(userId);
  if (!profile) {
    throw new HttpError(404, "PROFILE_NOT_FOUND");
  }
  return profile;
}

export function getProfile(userId) {
  return requireProfile(userId);
}

export async function setProfileSource(userId, input) {
  const { analysisId } = parseInput(sourceSchema, input);
  const { cvId, result } = await getAnalysis(userId, analysisId);
  const cvText = await readSavedCvContent(userId, cvId);
  const details = result.analysis;
  const skillIds = await findApprovedSkillIdsByNames(
    result.skills.map((skill) => skill.name),
  );

  await saveProfileFromAnalysis(userId, {
    analysisId,
    displayName: nameFromCv(cvText, details.profile?.headline),
    headline: cut(details.profile?.headline, MAX_HEADLINE),
    seniority: details.seniority ?? null,
    location: cut(details.profile?.location, MAX_LOCATION),
    score: details.overallScore ?? null,
    skillIds: skillIds.slice(0, MAX_SKILLS),
  });
  return requireProfile(userId);
}

export async function updateProfile(userId, input) {
  const fields = parseInput(fieldsSchema, input);
  const profile = await requireProfile(userId);
  await updateProfileFields(userId, {
    displayName: keep(fields.displayName, profile.displayName),
    headline: keep(fields.headline, profile.headline),
    location: keep(fields.location, profile.location),
  });
  return requireProfile(userId);
}

export async function setProfileSkills(userId, input) {
  const { skillIds } = parseInput(skillsSchema, input);
  const uniqueIds = [...new Set(skillIds)];
  await requireProfile(userId);
  if ((await countApprovedSkills(uniqueIds)) !== uniqueIds.length) {
    throw new HttpError(400, "SKILL_NOT_FOUND");
  }
  await replaceProfileSkills(userId, uniqueIds);
  return requireProfile(userId);
}

export async function setPublication(userId, input) {
  const { published } = parseInput(publicationSchema, input);
  await requireProfile(userId);
  await setProfilePublication(userId, published);
  return requireProfile(userId);
}
