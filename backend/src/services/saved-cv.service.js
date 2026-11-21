import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  countSavedCvs,
  deleteSavedCv,
  findSavedCv,
  insertSavedCv,
  listSavedCvs,
} from "../models/saved-cv.model.js";
import { buildCvMarkdown, normalizeCreatorCv } from "../utils/cv-markdown.js";
import { decryptBytes, encryptBytes } from "../utils/encryption.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import { getLatestAnalysisForCv } from "./analysis.service.js";
import { getUserDataKey } from "./user-crypto.service.js";

const MAX_SAVED_CVS = 10;
const MAX_CONTENT_CHARS = 50_000;

const nameSchema = z
  .string({ error: "CV_NAME_REQUIRED" })
  .trim()
  .min(1, "CV_NAME_REQUIRED")
  .max(255, "CV_NAME_TOO_LONG");

const saveSchema = z.object({
  name: nameSchema,
  content: z
    .string({ error: "CV_CONTENT_REQUIRED" })
    .trim()
    .min(1, "CV_CONTENT_REQUIRED")
    .max(MAX_CONTENT_CHARS, "CV_CONTENT_TOO_LONG"),
});

function textField(max) {
  return z
    .string("CV_FIELD_INVALID")
    .trim()
    .max(max, "CV_FIELD_TOO_LONG")
    .default("");
}

function listField(item, max) {
  return z
    .array(item, "CV_FIELD_INVALID")
    .max(max, "CV_LIST_TOO_LONG")
    .default([]);
}

const creatorSchema = z.object({
  name: nameSchema,
  fullName: textField(150),
  headline: z
    .string("CV_HEADLINE_REQUIRED")
    .trim()
    .min(1, "CV_HEADLINE_REQUIRED")
    .max(150, "CV_FIELD_TOO_LONG"),
  email: textField(254),
  phone: textField(40),
  summary: textField(2000),
  experience: listField(
    z.object({
      title: textField(150),
      company: textField(150),
      start: textField(30),
      end: textField(30),
      highlights: listField(textField(300), 10),
    }),
    20,
  ),
  education: listField(
    z.object({
      degree: textField(150),
      school: textField(150),
      start: textField(30),
      end: textField(30),
    }),
    10,
  ),
  skills: listField(textField(100), 50),
  languages: listField(
    z.object({
      name: textField(50),
      level: textField(30),
    }),
    10,
  ),
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

async function insertCv(userId, { name, content, source }) {
  if ((await countSavedCvs(userId)) >= MAX_SAVED_CVS) {
    throw new HttpError(409, "CV_LIMIT", { max: MAX_SAVED_CVS });
  }

  const dataKey = await getUserDataKey(userId);
  const saved = await insertSavedCv({
    userId,
    nameEnc: encryptText(name, dataKey),
    contentEnc: encryptText(content, dataKey),
    source,
  });
  return readSummary(saved, dataKey);
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
  return insertCv(userId, { name, content, source: "upload" });
}

export async function saveCreatorCv(userId, input) {
  const { name, ...fields } = parseInput(creatorSchema, input);
  const content = buildCvMarkdown(normalizeCreatorCv(fields));
  if (content.length > MAX_CONTENT_CHARS) {
    throw new HttpError(400, "CV_CONTENT_TOO_LONG", {
      max: MAX_CONTENT_CHARS,
    });
  }
  return insertCv(userId, { name, content, source: "creator" });
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
    latestAnalysis: await getLatestAnalysisForCv(userId, cvId),
  };
}

export async function readSavedCvContent(userId, cvId) {
  if (!cvId) {
    return null;
  }
  const cv = await findSavedCv(userId, cvId);
  if (!cv) {
    return null;
  }
  const dataKey = await getUserDataKey(userId);
  return decryptText(cv.contentEnc, dataKey);
}

export async function removeSavedCv(userId, cvId) {
  parseId(cvId, "CV_NOT_FOUND");
  if (!(await deleteSavedCv(userId, cvId))) {
    throw new HttpError(404, "CV_NOT_FOUND");
  }
}
