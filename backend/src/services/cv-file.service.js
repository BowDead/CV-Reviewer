import { HttpError } from "../errors/HttpError.js";
import {
  countCvFiles,
  deleteCvFile,
  findCvFileContent,
  insertCvFile,
  listCvFiles,
} from "../models/cv-file.model.js";
import { decryptBytes, encryptBytes } from "../utils/encryption.js";
import { parseId } from "../utils/parse-id.js";
import { parseCv } from "./cv.service.js";
import { getUserDataKey } from "./user-crypto.service.js";

const MAX_CV_FILES = 10;

const MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function withFileName(file, dataKey) {
  return {
    id: file.id,
    fileName: decryptBytes(file.fileNameEnc, dataKey).toString("utf8"),
    mimeType: file.mimeType,
    createdAt: file.createdAt,
  };
}

export async function getCvFiles(userId) {
  const files = await listCvFiles(userId);
  if (files.length === 0) {
    return [];
  }
  const dataKey = await getUserDataKey(userId);
  return files.map((file) => withFileName(file, dataKey));
}

export async function saveCvFile(userId, file) {
  if ((await countCvFiles(userId)) >= MAX_CV_FILES) {
    throw new HttpError(409, "CV_FILE_LIMIT", { max: MAX_CV_FILES });
  }
  const { kind } = await parseCv(file);

  const dataKey = await getUserDataKey(userId);
  const saved = await insertCvFile({
    userId,
    fileEnc: encryptBytes(file.buffer, dataKey),
    fileNameEnc: encryptBytes(Buffer.from(file.originalname, "utf8"), dataKey),
    mimeType: MIME_TYPES[kind],
  });
  return withFileName(saved, dataKey);
}

export async function getCvFileContent(userId, fileId) {
  parseId(fileId, "CV_FILE_NOT_FOUND");
  const file = await findCvFileContent(userId, fileId);
  if (!file) {
    throw new HttpError(404, "CV_FILE_NOT_FOUND");
  }
  const dataKey = await getUserDataKey(userId);
  return {
    fileName: decryptBytes(file.fileNameEnc, dataKey).toString("utf8"),
    mimeType: file.mimeType,
    content: decryptBytes(file.fileEnc, dataKey),
  };
}

export async function removeCvFile(userId, fileId) {
  parseId(fileId, "CV_FILE_NOT_FOUND");
  if (!(await deleteCvFile(userId, fileId))) {
    throw new HttpError(404, "CV_FILE_NOT_FOUND");
  }
}
