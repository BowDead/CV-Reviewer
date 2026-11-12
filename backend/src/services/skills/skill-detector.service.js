import { escapeRegExp } from "../../utils/regexp.js";

const BEFORE = "(?<![\p{L}\p{N}_])";
const AFTER = "(?![\p{L}\p{N}_+#])";

export function createSkillDetector(skills) {
  const matchers = skills.map((skill) => {
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
    skills.flatMap((skill) =>
      [skill.name, ...skill.aliases].map((name) => [name.toLowerCase(), skill]),
    ),
  );

  return {
    detect(text) {
      return matchers
        .filter(({ pattern }) => pattern.test(text))
        .map(({ skill }) => skill);
    },
    find(name) {
      return skillsByName.get(name.trim().toLowerCase()) ?? null;
    },
  };
}
