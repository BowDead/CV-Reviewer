import path from "node:path";
import { HttpError } from "../errors/HttpError.js";

// Sygnatury Plików PDF oraz DOCX
const PDF_SIGNATURE = "%PDF";
const ZIP_SIGNATURES = [
  Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  Buffer.from([0x50, 0x4b, 0x05, 0x06]),
  Buffer.from([0x50, 0x4b, 0x07, 0x08]),
];

export function detectCvKind(fileName, buffer) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".pdf") {
    if (!buffer.subarray(0, 1024).includes(PDF_SIGNATURE)) {
      throw new HttpError(
        400,
        "Plik nie wygląda na prawidłowy plik PDF (Niezgodna zawartość).",
      );
    }
    return "pdf";
  }

  if (extension === ".docx") {
    const head = buffer.subarray(0, 4);
    if (!ZIP_SIGNATURES.some((signature) => head.equals(signature))) {
      throw new HttpError(
        400,
        "Plik nie wygląda na prawidłowy DOCX (niezgodna zawartość).",
      );
    }
    return "docx";
  }
  throw new HttpError(
    415,
    `Nieobsługiwany format pliku: ${extension || "(brak rozszerzenia)"}. Użyj PDF lub DOCX.`,
  );
}
