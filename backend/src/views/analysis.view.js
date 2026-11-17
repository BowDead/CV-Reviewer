import { cvAnalysisView } from "./cv-analysis.view.js";

export function analysisSummaryView(analysis) {
  return {
    id: analysis.id,
    cvId: analysis.cvId,
    model: analysis.model,
    language: analysis.language,
    overallScore: analysis.overallScore,
    seniority: analysis.seniority,
    isProfileSource: analysis.isProfileSource,
    createdAt: analysis.createdAt,
  };
}

export function storedAnalysisView(analysis) {
  return cvAnalysisView({
    ...analysis.result,
    analysisId: analysis.id,
    cached: true,
    analyzedAt: analysis.createdAt,
  });
}

export function analysisDetailView(analysis) {
  return {
    ...analysisSummaryView(analysis),
    result: storedAnalysisView(analysis),
  };
}
