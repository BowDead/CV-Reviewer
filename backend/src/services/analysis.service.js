import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  deleteAnalysis,
  findAnalysis,
  findLatestAnalysisForCv,
  insertAnalysis,
  listAnalyses,
} from "../models/analysis.model.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import { analyzeCv } from "./cv-analysis.service.js";

const ANALYSIS_LANGUAGE = "pl";
const FOREIGN_KEY_VIOLATION = "23503";

const sourceSchema = z.object({
  cvId: z.uuid().nullish().catch(null),
  useGithub: z.boolean().catch(false),
});

export async function analyzeAndSave(userId, input) {
  const { cvId, useGithub } = parseInput(sourceSchema, input);
  const result = await analyzeCv(input?.text, { userId, useGithub });

  const analysisId = await insertAnalysis({
    userId,
    cvId: cvId ?? null,
    model: result.model,
    language: ANALYSIS_LANGUAGE,
    result,
  });
  return { ...result, analysisId };
}

export function getAnalyses(userId) {
  return listAnalyses(userId);
}

export async function getAnalysis(userId, analysisId) {
  parseId(analysisId, "ANALYSIS_NOT_FOUND");
  const analysis = await findAnalysis(userId, analysisId);
  if (!analysis) {
    throw new HttpError(404, "ANALYSIS_NOT_FOUND");
  }
  return analysis;
}

export function getLatestAnalysisForCv(userId, cvId) {
  return findLatestAnalysisForCv(userId, cvId);
}

export async function removeAnalysis(userId, analysisId) {
  parseId(analysisId, "ANALYSIS_NOT_FOUND");
  let deleted;
  try {
    deleted = await deleteAnalysis(userId, analysisId);
  } catch (err) {
    if (err.code === FOREIGN_KEY_VIOLATION) {
      throw new HttpError(409, "ANALYSIS_IS_PROFILE_SOURCE");
    }
    throw err;
  }
  if (!deleted) {
    throw new HttpError(404, "ANALYSIS_NOT_FOUND");
  }
}
