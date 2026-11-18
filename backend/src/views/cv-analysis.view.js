export function cvAnalysisView(result) {
  return {
    analysisId: result.analysisId,
    analysis: result.analysis,
    skills: result.skills,
    unknownSkills: result.unknownSkills,
    truncated: result.truncated,
    githubRepositories: result.githubRepositories ?? 0,
    model: result.model,
    cached: result.cached ?? false,
    analyzedAt: result.analyzedAt ?? null,
  };
}
