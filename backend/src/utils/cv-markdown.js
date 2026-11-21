function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function joinParts(parts, separator) {
  return parts.filter(Boolean).join(separator);
}

function uniqueSkills(skills) {
  const result = [];
  for (const skill of skills ?? []) {
    const name = clean(skill);
    const known = result.some(
      (item) => item.toLowerCase() === name.toLowerCase(),
    );
    if (name && !known) {
      result.push(name);
    }
  }
  return result;
}

export function normalizeCreatorCv(cv) {
  return {
    fullName: clean(cv.fullName),
    headline: clean(cv.headline),
    email: clean(cv.email),
    phone: clean(cv.phone),
    summary: clean(cv.summary),
    experience: (cv.experience ?? [])
      .map((job) => ({
        title: clean(job.title),
        company: clean(job.company),
        start: clean(job.start),
        end: clean(job.end),
        highlights: (job.highlights ?? []).map(clean).filter(Boolean),
      }))
      .filter((job) => job.title || job.company),
    education: (cv.education ?? [])
      .map((school) => ({
        degree: clean(school.degree),
        school: clean(school.school),
        start: clean(school.start),
        end: clean(school.end),
      }))
      .filter((school) => school.degree || school.school),
    skills: uniqueSkills(cv.skills),
    languages: (cv.languages ?? [])
      .map((language) => ({
        name: clean(language.name),
        level: clean(language.level),
      }))
      .filter((language) => language.name),
  };
}

function entryBlocks(heading, entry, highlights = []) {
  const period = joinParts([entry.start, entry.end], " – ");
  const blocks = [joinParts([`### ${heading}`, period], "\n")];
  if (highlights.length > 0) {
    blocks.push(highlights.map((item) => `- ${item}`).join("\n"));
  }
  return blocks;
}

export function buildCvMarkdown(cv) {
  const blocks = [`# ${cv.fullName || cv.headline}`];
  if (cv.fullName) {
    blocks.push(`**${cv.headline}**`);
  }
  const contact = joinParts([cv.email, cv.phone], " · ");
  if (contact) {
    blocks.push(contact);
  }
  if (cv.summary) {
    blocks.push("## Podsumowanie", cv.summary);
  }
  if (cv.experience.length > 0) {
    blocks.push("## Doświadczenie");
    for (const job of cv.experience) {
      blocks.push(
        ...entryBlocks(
          joinParts([job.title, job.company], ", "),
          job,
          job.highlights,
        ),
      );
    }
  }
  if (cv.education.length > 0) {
    blocks.push("## Wykształcenie");
    for (const school of cv.education) {
      blocks.push(
        ...entryBlocks(joinParts([school.degree, school.school], ", "), school),
      );
    }
  }
  if (cv.skills.length > 0) {
    blocks.push("## Umiejętności", cv.skills.join(", "));
  }
  if (cv.languages.length > 0) {
    blocks.push(
      "## Języki",
      cv.languages
        .map((language) => joinParts([language.name, language.level], " – "))
        .map((line) => `- ${line}`)
        .join("\n"),
    );
  }
  return blocks.join("\n\n");
}
