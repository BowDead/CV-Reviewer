import { HttpError } from "../errors/HttpError.js";
import { detectCvKind } from "../utils/file-type.js";
import { extractPdfText } from "./parsers/pdf.parser.js";
import { extractDocxText } from "./parsers/docx.parser.js";

const parsers = {
  pdf: extractPdfText,
  docx: extractDocxText,
};

function normalizeText(text) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

export async function parseCv(file) {
  if (!file) {
    throw new HttpError(400, "FILE_MISSING");
  }
  if (file.size === 0) {
    throw new HttpError(400, "FILE_EMPTY");
  }
  const kind = detectCvKind(file.originalname, file.buffer);

  let parsed;
  try {
    parsed = await parsers[kind](file.buffer);
  } catch (err) {
    console.error("Błąd parsowania CV:", err);
    throw new HttpError(400, "FILE_UNREADABLE");
  }

  const text = normalizeText(parsed.text);
  if (!text) {
    throw new HttpError(422, "FILE_NO_TEXT");
  }
  return {
    kind,
    text,
    pageCount: parsed.pageCount,
    stats: {
      characters: text.length,
      words: countWords(text),
    },
  };
}
