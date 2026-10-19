import { parseCv } from "../services/cv.service.js";
import { analyzeCv } from "../services/cv-analysis.service.js";
import { parsedCvView } from "../views/cv.view.js";
import { cvAnalysisView } from "../views/cv-analysis.view.js";

export async function postParseCv(req, res) {
  const parsedCv = await parseCv(req.file);
  res.json(parsedCvView(parsedCv));
}

export async function postAnalyzeCv(req, res) {
  const result = await analyzeCv(req.body?.text);
  res.json(cvAnalysisView(result));
}
