export function cvAnalysisView(result) {
  return {
    analysis: result.analysis,
    skills: result.skills,
    unknownSkills: result.unknownSkills,
    truncated: result.truncated,
    model: result.model,
  };
}
