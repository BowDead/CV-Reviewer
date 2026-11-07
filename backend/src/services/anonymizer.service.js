import { HttpError } from "../errors/HttpError.js";
import { escapeRegExp } from "../utils/regexp.js";

const NAME_LINE_RE =
  /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[ -][A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+){1,2}$/;

// Imię i nazwisko
function guessFullName(text) {
  const firstLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    firstLines.find((line) => line.length <= 50 && NAME_LINE_RE.test(line)) ??
    null
  );
}

const RULES = [
  {
    name: "email",
    pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g,
    replacement: "[EMAIL]",
  },
  { name: "pesel", pattern: /(?<!\d)\d{11}(?!\d)/g, replacement: "[PESEL]" },
  {
    name: "phone",
    pattern: /(?<![\w+])(?:\+|00)?(?:48[\s-]?)?(?:\d[\s-]?){8}\d(?!\d)/g,
    replacement: "[TELEFON]",
  },
  {
    name: "githubLink",
    pattern: /(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,;)]+/gi,
    replacement: "[LINK GITHUB]",
  },
  {
    name: "linkedinLink",
    pattern: /(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/[^\s,;)]+/gi,
    replacement: "[LINK LINKEDIN]",
  },
  {
    name: "link",
    pattern:
      /(?<![\w.-])(?:https?:\/\/)?(?:www\.)?(?:facebook|instagram|twitter|x)\.com\/[^\s,;)]+/gi,
    replacement: "[LINK]",
  },
  {
    name: "link",
    pattern: /(?:https?:\/\/|www\.)[^\s,;)]+/gi,
    replacement: "[LINK]",
  },
  {
    name: "address",
    pattern:
      /\b(?:ul\.|ulica|al\.|aleja|os\.)\s+[^\n,]{2,40}?\s\d+[a-zA-Z]?(?:\/\d+)?/gi,
    replacement: "[ADRES]",
  },
  {
    name: "address",
    pattern:
      /(?<=^|[\n,;:|][ \t]*)[^\s,;:|][^\n,;:|]{0,40}?\s\d+[a-zA-Z]?(?:\/\d+)?[\s,]+\d{2}-\d{3}[ \t]+\p{Lu}[\p{L}-]*(?:[ \t]\p{Lu}[\p{L}-]*)?/gmu,
    replacement: "[ADRES]",
  },
  {
    name: "postalCode",
    pattern: /(?<!\d)\d{2}-\d{3}(?!\d)/g,
    replacement: "[KOD POCZTOWY]",
  },
  {
    name: "birthDate",
    pattern:
      /(?<=(?:data urodzenia|date of birth|ur\.)\s*:?\s*)[\d./-]{6,10}/gi,
    replacement: "[DATA]",
  },
];

const MAX_INPUT_CHARS = 50_000;

function findMatches(text) {
  const matches = [];
  const isFree = (start, end) =>
    matches.every((match) => end <= match.start || start >= match.end);

  const collect = (type, pattern, label) => {
    for (const found of text.matchAll(pattern)) {
      const start = found.index;
      const end = start + found[0].length;
      if (end > start && isFree(start, end)) {
        matches.push({ start, end, type, label });
      }
    }
  };

  const fullName = guessFullName(text);
  if (fullName) {
    collect(
      "fullName",
      new RegExp(escapeRegExp(fullName), "g"),
      "[IMIĘ I NAZWISKO]",
    );
  }
  for (const rule of RULES) {
    collect(rule.name, rule.pattern, rule.replacement);
  }

  return matches.sort((a, b) => a.start - b.start);
}

export function anonymize(text) {
  const segments = [];
  let position = 0;

  for (const { start, end, type, label } of findMatches(text)) {
    if (start > position) {
      segments.push({ text: text.slice(position, start) });
    }
    segments.push({ text: text.slice(start, end), type, label });
    position = end;
  }
  if (position < text.length) {
    segments.push({ text: text.slice(position) });
  }

  return segments;
}

export function anonymizeCv(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new HttpError(400, "CV_TEXT_MISSING");
  }
  if (text.length > MAX_INPUT_CHARS) {
    throw new HttpError(413, "CV_TEXT_TOO_LONG");
  }
  return anonymize(text);
}
