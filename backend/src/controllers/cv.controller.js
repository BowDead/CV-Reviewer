import { parseCv } from "../services/cv.service";
import { parsedCvView } from "../views/cv.view";

export async function postParseCv(req, res) {
  const parsedCv = await parseCv(req.file);
  res.json(parsedCvView(parsedCv));
}
