import {
  getAnalyses,
  getAnalysis,
  removeAnalysis,
} from "../services/analysis.service.js";
import {
  analysisDetailView,
  analysisSummaryView,
} from "../views/analysis.view.js";

export async function getAnalysisList(req, res) {
  const analyses = await getAnalyses(req.user.id);
  res.json({ analyses: analyses.map(analysisSummaryView) });
}

export async function getAnalysisDetail(req, res) {
  const analysis = await getAnalysis(req.user.id, req.params.id);
  res.json(analysisDetailView(analysis));
}

export async function deleteAnalysisItem(req, res) {
  await removeAnalysis(req.user.id, req.params.id);
  res.status(204).end();
}
