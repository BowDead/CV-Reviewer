import { SKILL_DICTIONARY } from "../../data/skill-dictionary.js";
import { escapeRegExp } from "../../utils/regexp.js";

const BEFORE = "(?<![\\p{L}\\p{N}_])";
const AFTER = "(?![\\p{L}\\p{N}_+#])";

const matchers = SKILL_DICTIONARY.map((skill) => {
  const names = [skill.name, ...skill.aliases].map(escapeRegExp).join("|");
  return {
    skill,
    pattern: new RegExp(
      `${BEFORE}(?:${names})${AFTER}`,
      skill.caseSensitive ? "u" : "iu",
    ),
  };
});

const skillsByName = new Map(
  SKILL_DICTIONARY.flatMap((skill) =>
    [skill.name, ...skill.aliases].map((name) => [name.toLowerCase(), skill]),
  ),
);
