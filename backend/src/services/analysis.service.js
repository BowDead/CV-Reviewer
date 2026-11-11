import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  deleteAnalysis,
  findAnalysis,
  insertAnalysis,
  listAnalyses,
} from "../models/analysis.model.js";
import { decryptBytes, encryptBytes } from "../utils/encryption.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import { analyzeCv } from "./cv-analysis.service.js";
import { getUserDataKey } from "./user-crypto.service.js";

const ANALYSIS_LANGUAGE = "pl";
const FOREIGN_KEY_VIOLATION = "23503";

const sourceSchema = z.object({
  cvFileId: z.uuid().nullish().catch(null),
  fileName: z.string().trim().max(255).nullish().catch(null),
});

function encryptJson(value, dataKey) {
  return encryptBytes(Buffer.from(JSON.stringify(value), "utf8"), dataKey);
}

function decryptJson(stored, dataKey) {
  return JSON.parse(decryptBytes(stored, dataKey).toString("utf8"));
}

function readAnalysis(analysis, dataKey) {
  const { fileName, result } = decryptJson(analysis.resultEnc, dataKey);
  return {
    id: analysis.id,
    cvFileId: analysis.cvFileId,
    fileName,
    model: analysis.model,
    language: analysis.language,
    isProfileSource: analysis.isProfileSource,
    createdAt: analysis.createdAt,
    result,
  };
}

export async function analyzeAndSave(userId, input) {
  const { cvFileId, fileName } = parseInput(sourceSchema, input);
  const result = await analyzeCv(input?.text, { userId });

  const dataKey = await getUserDataKey(userId);
  const analysisId = await insertAnalysis({
    userId,
    cvFileId: cvFileId ?? null,
    model: result.model,
    language: ANALYSIS_LANGUAGE,
    resultEnc: encryptJson({ fileName: fileName || null, result }, dataKey),
  });
  return { ...result, analysisId };
}

export async function getAnalyses(userId) {
  const analyses = await listAnalyses(userId);
  if (analyses.length === 0) {
    return [];
  }
  const dataKey = await getUserDataKey(userId);
  return analyses.map((analysis) => readAnalysis(analysis, dataKey));
}

export async function getAnalysis(userId, analysisId) {
  parseId(analysisId, "ANALYSIS_NOT_FOUND");
  const analysis = await findAnalysis(userId, analysisId);
  if (!analysis) {
    throw new HttpError(404, "ANALYSIS_NOT_FOUND");
  }
  const dataKey = await getUserDataKey(userId);
  return readAnalysis(analysis, dataKey);
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
