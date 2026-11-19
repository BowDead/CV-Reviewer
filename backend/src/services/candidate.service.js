import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  findPublishedCandidate,
  searchCandidates,
} from "../models/candidate.model.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import { SENIORITY_LEVELS } from "./ai/cv-analysis.schema.js";
import { matchOffer } from "./offers/offer-matching.service.js";
import { getPosition } from "./position.service.js";

const MAX_RESULTS = 50;
const MAX_RANKED = 500;

function toIdList(value) {
  if (value === undefined || value === "") {
    return [];
  }
  const parts = Array.isArray(value) ? value : String(value).split(",");
  return parts.map((part) => Number(part));
}

const searchSchema = z.object({
  skills: z.preprocess(
    toIdList,
    z
      .array(z.int("SKILL_NOT_FOUND").positive("SKILL_NOT_FOUND"))
      .max(20, "INVALID_INPUT"),
  ),
  seniority: z
    .enum(SENIORITY_LEVELS, "INVALID_INPUT")
    .or(z.literal(""))
    .optional()
    .transform((value) => value || null),
  location: z
    .string("INVALID_INPUT")
    .trim()
    .max(100, "INVALID_INPUT")
    .optional()
    .transform((value) => value || null),
  positionId: z
    .string("POSITION_NOT_FOUND")
    .optional()
    .transform((value) => value || null),
});

function rankForPosition(candidates, position) {
  const requirements = {
    requiredSkills: position.skills
      .filter((skill) => skill.isRequired)
      .map((skill) => skill.name),
    niceToHaveSkills: position.skills
      .filter((skill) => !skill.isRequired)
      .map((skill) => skill.name),
  };
  return candidates
    .map((candidate) => ({
      ...candidate,
      match: matchOffer(
        requirements,
        new Set(candidate.skills.map((skill) => skill.name.toLowerCase())),
      ),
    }))
    .filter((candidate) => candidate.match.score > 0)
    .sort(
      (a, b) =>
        b.match.score - a.match.score || (b.score ?? 0) - (a.score ?? 0),
    )
    .slice(0, MAX_RESULTS);
}

export async function findCandidates(employerId, input) {
  const { skills, seniority, location, positionId } = parseInput(
    searchSchema,
    input,
  );
  const filters = {
    skillIds: [...new Set(skills)],
    seniority,
    location,
  };

  if (!positionId) {
    return searchCandidates({ ...filters, limit: MAX_RESULTS });
  }
  const position = await getPosition(employerId, positionId);
  const candidates = await searchCandidates({ ...filters, limit: MAX_RANKED });
  return rankForPosition(candidates, position);
}

export async function getCandidate(candidateId) {
  parseId(candidateId, "CANDIDATE_NOT_FOUND");
  const candidate = await findPublishedCandidate(candidateId);
  if (!candidate) {
    throw new HttpError(404, "CANDIDATE_NOT_FOUND");
  }
  return candidate;
}
