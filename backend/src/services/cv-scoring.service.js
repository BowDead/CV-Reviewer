import { CV_CATEGORIES, CV_CRITERIA } from "./ai/cv-criteria.js";

const EMAIL = /\[EMAIL\]|[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE = /\[TELEFON\]|\b(?:\+48[\s-]?)?\d{3}[\s-]?\d{3}[\s-]?\d{3}\b/;
const PROFILE = /\[LINK (?:GITHUB|LINKEDIN)\]|github\.com\/|linkedin\.com\//i;

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[*_#`>]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsQuote(cvText, quote) {
  const needle = normalize(quote);
  return needle.length > 0 && normalize(cvText).includes(needle);
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function checkSystemCriteria(cvText, skillNames) {
  const hasEmail = EMAIL.test(cvText);
  const hasPhone = PHONE.test(cvText);
  const words = countWords(cvText);

  let lengthLevel = 0;
  if (words >= 250 && words <= 1200) {
    lengthLevel = 2;
  } else if (words >= 150 && words <= 1800) {
    lengthLevel = 1;
  }

  let skillsLevel = 0;
  if (skillNames.length >= 8) {
    skillsLevel = 2;
  } else if (skillNames.length >= 4) {
    skillsLevel = 1;
  }

  return {
    contact: {
      level: Number(hasEmail) + Number(hasPhone),
      evidence: [hasEmail && "e-mail", hasPhone && "telefon"]
        .filter(Boolean)
        .join(", "),
    },
    profiles: {
      level: PROFILE.test(cvText) ? 2 : 0,
      evidence: "",
    },
    length: { level: lengthLevel, evidence: `${words} słów` },
    skillsCount: {
      level: skillsLevel,
      evidence: skillNames.slice(0, 8).join(", "),
    },
  };
}

function checkLlmCriterion(criterion, answer, cvText) {
  if (!answer) {
    return { level: null, evidence: "", comment: "" };
  }
  const quoted = containsQuote(cvText, answer.evidence);
  const unproven = criterion.needsEvidence && answer.level > 0 && !quoted;
  return {
    level: unproven ? answer.level - 1 : answer.level,
    evidence: quoted ? answer.evidence : "",
    comment: answer.comment,
  };
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function scoreOf(levels) {
  const rated = levels.filter((level) => level !== null);
  if (rated.length === 0) {
    return null;
  }
  const sum = rated.reduce((total, level) => total + level, 0);
  return roundOne((sum / (rated.length * 2)) * 10);
}

export function scoreCv(cvText, llmAnswers, skillNames) {
  const system = checkSystemCriteria(cvText, skillNames);
  const answers = new Map(llmAnswers.map((answer) => [answer.id, answer]));

  function evaluate(criterion) {
    const result =
      criterion.source === "system"
        ? { ...system[criterion.id], comment: "" }
        : checkLlmCriterion(criterion, answers.get(criterion.id), cvText);
    return {
      id: criterion.id,
      label: criterion.label,
      source: criterion.source,
      ...result,
    };
  }

  const categories = CV_CATEGORIES.map((name) => {
    const criteria = CV_CRITERIA.filter(
      (criterion) => criterion.category === name,
    ).map(evaluate);
    return {
      name,
      score: scoreOf(criteria.map((criterion) => criterion.level)),
      criteria,
    };
  });

  const scores = categories
    .map((category) => category.score)
    .filter((score) => score !== null);
  const overallScore =
    scores.length === 0
      ? null
      : roundOne(scores.reduce((a, b) => a + b, 0) / scores.length);

  return { overallScore, categories };
}

export function keepRewritesFromCv(rewrites, cvText) {
  return rewrites.filter((rewrite) => containsQuote(cvText, rewrite.original));
}
