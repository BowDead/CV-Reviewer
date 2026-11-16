import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  countSavedCvs,
  deleteSavedCv,
  findSavedCv,
  insertSavedCv,
  listSavedCvs,
} from "../models/saved-cv.model.js";
import { decryptBytes, encryptBytes } from "../utils/encryption.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import { getUserDataKey } from "./user-crypto.service.js";

const MAX_SAVED_CVS = 10;
const MAX_CONTENT_CHARS = 50_000;

const saveSchema = z.object({
  name: z
    .string({ error: "CV_NAME_REQUIRED" })
    .trim()
    .min(1, "CV_NAME_REQUIRED")
    .max(255, "CV_NAME_TOO_LONG"),
  content: z
    .string({ error: "CV_CONTENT_REQUIRED" })
    .trim()
    .min(1, "CV_CONTENT_REQUIRED")
    .max(MAX_CONTENT_CHARS, "CV_CONTENT_TOO_LONG"),
});

function encryptText(text, dataKey) {
  return encryptBytes(Buffer.from(text, "utf8"), dataKey);
}

function decryptText(stored, dataKey) {
  return decryptBytes(stored, dataKey).toString("utf8");
}

function readSummary(cv, dataKey) {
  return {
    id: cv.id,
    name: decryptText(cv.nameEnc, dataKey),
    source: cv.source,
    createdAt: cv.createdAt,
  };
}

export async function getSavedCvs(userId) {
  const cvs = await listSavedCvs(userId);
  if (cvs.length === 0) {
    return [];
  }
  const dataKey = await getUserDataKey(userId);
  return cvs.map((cv) => readSummary(cv, dataKey));
}

export async function saveCv(userId, input) {
  const { name, content } = parseInput(saveSchema, input);
  if ((await countSavedCvs(userId)) >= MAX_SAVED_CVS) {
    throw new HttpError(409, "CV_LIMIT", { max: MAX_SAVED_CVS });
  }

  const dataKey = await getUserDataKey(userId);
  const saved = await insertSavedCv({
    userId,
    nameEnc: encryptText(name, dataKey),
    contentEnc: encryptText(content, dataKey),
    source: "upload",
  });
  return readSummary(saved, dataKey);
}

export async function getSavedCv(userId, cvId) {
  parseId(cvId, "CV_NOT_FOUND");
  const cv = await findSavedCv(userId, cvId);
  if (!cv) {
    throw new HttpError(404, "CV_NOT_FOUND");
  }
  const dataKey = await getUserDataKey(userId);
  return {
    ...readSummary(cv, dataKey),
    content: decryptText(cv.contentEnc, dataKey),
  };
}

export async function removeSavedCv(userId, cvId) {
  parseId(cvId, "CV_NOT_FOUND");
  if (!(await deleteSavedCv(userId, cvId))) {
    throw new HttpError(404, "CV_NOT_FOUND");
  }
}
