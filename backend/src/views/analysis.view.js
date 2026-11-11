import { cvAnalysisView } from "./cv-analysis.view.js";

export function analysisSummaryView(analysis) {
  return {
    id: analysis.id,
    cvFileId: analysis.cvFileId,
    fileName: analysis.fileName,
    model: analysis.model,
    language: analysis.language,
    overallScore: analysis.result.analysis.overallScore,
    seniority: analysis.result.analysis.seniority,
    isProfileSource: analysis.isProfileSource,
    createdAt: analysis.createdAt,
  };
}

export function analysisDetailView(analysis) {
  return {
    ...analysisSummaryView(analysis),
    result: cvAnalysisView(analysis.result),
  };
}
