import { describe, expect, test } from "vitest";
import { createSkillDetector } from "../../src/services/skills/skill-detector.service.js";

function skill(name, options = {}) {
  return {
    name,
    aliases: [],
    caseSensitive: false,
    githubLanguage: null,
    ...options,
  };
}

const detector = createSkillDetector([
  skill("Java", { caseSensitive: true, aliases: ["Javy", "Javie"] }),
  skill("JavaScript", { aliases: ["JS"], githubLanguage: "JavaScript" }),
  skill("C", { caseSensitive: true }),
  skill("C++", { aliases: ["CPP"] }),
  skill("C#"),
  skill("Go", { caseSensitive: true, aliases: ["Golang"] }),
  skill("Node.js", { caseSensitive: true, aliases: ["Node"] }),
  skill(".NET", { aliases: ["ASP.NET"] }),
  skill("Python"),
]);

function names(skills) {
  return skills.map((item) => item.name);
}

describe("skill detection in text", () => {
  // Skills that must be found
  test("given a full skill name when detect then the skill is returned", () => {
    // Arrange
    const text = "Programowanie w JavaScript";
    const expected = ["JavaScript"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  test("given an alias when detect then the skill of the alias is returned", () => {
    // Arrange
    const text = "Testy w JS";
    const expected = ["JavaScript"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  test("given an inflected form when detect then the skill in its base form is returned", () => {
    // Arrange
    const text = "Trzy lata w Javie";
    const expected = ["Java"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  test("given names in any letter case when detect then the skills are returned", () => {
    // Arrange
    const text = "javascript i cpp";
    const expected = ["JavaScript", "C++"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  test("given an alias at the end of a sentence when detect then the skill of the alias is returned", () => {
    // Arrange
    const text = "Testy w JS.";
    const expected = ["JavaScript"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  test("given a name starting with a dot when detect then the skill is returned", () => {
    // Arrange
    const text = "Backend w .NET";
    const expected = [".NET"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  test("given names separated by commas when detect then every name is returned", () => {
    // Arrange
    const text = "Java, C#, Go";
    const expected = ["Java", "C#", "Go"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  // Similar names that must not be confused
  test("given Java inside JavaScript when detect then Java is not returned", () => {
    // Arrange
    const text = "JavaScript";
    const unexpected = "Java";

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).not.toContain(unexpected);
  });

  test("given C inside C++ when detect then C is not returned", () => {
    // Arrange
    const text = "C++";
    const unexpected = "C";

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).not.toContain(unexpected);
  });

  test("given C inside C# when detect then C is not returned", () => {
    // Arrange
    const text = "C#";
    const unexpected = "C";

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).not.toContain(unexpected);
  });

  test("given Go as a plain word when detect then Go is not returned", () => {
    // Arrange
    const text = "go home";
    const unexpected = "Go";

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).not.toContain(unexpected);
  });

  test("given Go inside a word when detect then Go is not returned", () => {
    // Arrange
    const text = "Google";
    const unexpected = "Go";

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).not.toContain(unexpected);
  });

  // Extra matches kept on purpose
  test("given JavaScript in the name Node.js when detect then JavaScript and Node.js are returned", () => {
    // Arrange
    const text = "Serwer w Node.js.";
    const expected = ["JavaScript", "Node.js"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  test("given JavaScript in the name Vue.js when detect then JavaScript is returned", () => {
    // Arrange
    const text = "Frontend w Vue.js";
    const expected = ["JavaScript"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  test("given a name after a dot without a space when detect then the skill is returned", () => {
    // Arrange
    const text = "backend.Python";
    const expected = ["Python"];

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual(expected);
  });

  // No skills
  test("given a text without skills when detect then an empty list is returned", () => {
    // Arrange
    const text = "Obsługa klienta i praca w zespole";

    // Act
    const skills = detector.detect(text);

    // Assert
    expect(names(skills)).toEqual([]);
  });
});

describe("single skill lookup", () => {
  test("given an alias with different case and spaces when find then the skill of the alias is returned", () => {
    // Arrange
    const name = "  golang ";

    // Act
    const result = detector.find(name);

    // Assert
    expect(result.name).toBe("Go");
  });

  test("given a GitHub language when findByLanguage then the skill for the language is returned", () => {
    // Arrange
    const language = "JavaScript";

    // Act
    const result = detector.findByLanguage(language);

    // Assert
    expect(result.name).toBe("JavaScript");
  });

  test("given an unknown name when find then null is returned", () => {
    // Arrange
    const name = "Cobol";

    // Act
    const result = detector.find(name);

    // Assert
    expect(result).toBeNull();
  });
});
