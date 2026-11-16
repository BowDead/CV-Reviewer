import {
  getSavedCv,
  getSavedCvs,
  removeSavedCv,
  saveCv,
} from "../services/saved-cv.service.js";
import { savedCvSummaryView, savedCvView } from "../views/saved-cv.view.js";

export async function getSavedList(req, res) {
  const cvs = await getSavedCvs(req.user.id);
  res.json({ cvs: cvs.map(savedCvSummaryView) });
}

export async function postSaved(req, res) {
  const cv = await saveCv(req.user.id, req.body);
  res.status(201).json({ cv: savedCvSummaryView(cv) });
}

export async function getSavedItem(req, res) {
  const cv = await getSavedCv(req.user.id, req.params.id);
  res.set("Cache-Control", "private, no-store");
  res.json(savedCvView(cv));
}

export async function deleteSavedItem(req, res) {
  await removeSavedCv(req.user.id, req.params.id);
  res.status(204).end();
}
