import { parseCv } from "../services/cv.service.js";
import { anonymizeCv } from "../services/anonymizer.service.js";
import { analyzeCv } from "../services/cv-analysis.service.js";
import { anonymizedCvView, parsedCvView } from "../views/cv.view.js";
import { cvAnalysisView } from "../views/cv-analysis.view.js";

export async function postParseCv(req, res) {
  const parsedCv = await parseCv(req.file);
  res.json(parsedCvView(parsedCv));
}

export async function postAnonymizeCv(req, res) {
  const segments = anonymizeCv(req.body?.text);
  res.json(anonymizedCvView(segments));
}

export async function postAnalyzeCv(req, res) {
  const result = await analyzeCv(req.body?.text);
  res.json(cvAnalysisView(result));
}
