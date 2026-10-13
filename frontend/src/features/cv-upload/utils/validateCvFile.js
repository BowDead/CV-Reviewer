import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_MB } from "../constants";

export function validateCvFile(file) {
  const name = file.name.toLowerCase();

  if (!ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return "Nieobsługiwany format pliku. Wybierz PDF lub DOCX.";
  }

  if (file.size === 0) {
    return "Plik jest pusty.";
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `Plik jest za duży (limit ${MAX_FILE_SIZE_MB} MB).`;
  }

  return null;
}
