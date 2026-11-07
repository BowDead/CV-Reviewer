import { ACCEPTED_EXTENSIONS, MAX_FILE_SIZE_MB } from "../constants";

export function validateCvFile(file) {
  const name = file.name.toLowerCase();

  if (!ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return { code: "FILE_UNSUPPORTED" };
  }

  if (file.size === 0) {
    return { code: "FILE_EMPTY" };
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { code: "FILE_TOO_LARGE", params: { maxMb: MAX_FILE_SIZE_MB } };
  }

  return null;
}
