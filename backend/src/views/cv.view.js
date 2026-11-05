export function parsedCvView(parsedCv) {
  return {
    analysis: result.analysis,
    skills: result.skills,
    unknownSkills: result.unknownSkills,
    privacy: {
      anonymized: result.anonymization,
    },
    truncated: result.truncated,
    model: result.model,
  };
}
