export function cvAnalysisView(result) {
  return {
    analysis: result.analysis,
    privacy: {
      anonymized: result.anonymization,
    },
    truncated: result.truncated,
    model: result.model,
  };
}
