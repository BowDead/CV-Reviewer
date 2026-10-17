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
  // Linki
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
    name: "postalCode",
    pattern: /(?<!\d)\d{2}-\d{3}(?!\d)/g,
    replacement: "[KOD POCZTOWY]",
  },
  {
    name: "birthDate",
    pattern: /(data urodzenia|date of birth|ur\.)\s*:?\s*[\d./-]{6,10}/gi,
    replacement: "$1: [DATA]",
  },
];

function replaceAndCount(text, pattern, replacement) {
  const count = text.match(pattern)?.length ?? 0;
  return { text: count ? text.replace(pattern, replacement) : text, count };
}

export function anonymize(text) {
  const counts = {};
  let result = text;

  const fullName = guessFullName(text);
  if (fullName) {
    const replaced = replaceAndCount(
      result,
      new RegExp(escapeRegExp(fullName), "g"),
      "[IMIĘ I NAZWISKO]",
    );
    result = replaced.text;
    if (replaced.count) counts.fullName = replaced.count;
  }

  for (const rule of RULES) {
    const replaced = replaceAndCount(result, rule.pattern, rule.replacement);
    result = replaced.text;
    if (replaced.count)
      counts[rule.name] = (counts[rule.name] ?? 0) + replaced.count;
  }

  return { text: result, counts };
}
