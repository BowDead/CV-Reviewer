import { parseCv } from "../services/cv.service.js";
import { parsedCvView } from "../views/cv.view.js";

export async function postParseCv(req, res) {
  const parsedCv = await parseCv(req.file);
  res.json(parsedCvView(parsedCv));
}
