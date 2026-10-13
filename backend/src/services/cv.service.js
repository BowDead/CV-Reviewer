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
    throw new HttpError(400, "Nie przesłano pliku.");
  }
  if (file.size === 0) {
    throw new HttpError(400, "Plik jest pusty.");
  }
  const kind = detectCvKind(file.originalname, file.buffer);

  let parsed;
  try {
    parsed = await parsers[kind](file.buffer);
  } catch {
    throw new HttpError(
      400,
      "Nie udało się odczytać pliku. Jest uszkodzony lub ma nieprawidłowy format.",
    );
  }
  const text = normalizeText(parsed.text);
  if (!text) {
    throw new HttpError(
      422,
      "W pliku nie znaleziono tekstu. Jeśli to skan lub zdjęcie, wyeksportuj CV jako PDF z tekstem.",
    );
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
