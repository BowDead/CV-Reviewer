import { Router } from "express";
import { uploadCvFile } from "../middlewares/upload.middleware.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  postParseCv,
  postAnonymizeCv,
  postAnalyzeCv,
} from "../controllers/cv.controller.js";
import {
  deleteSavedItem,
  getSavedItem,
  getSavedList,
  postSaved,
} from "../controllers/saved-cv.controller.js";

export const cvRouter = Router();

cvRouter.use(requireAuth, requireRole("candidate", "admin"));

cvRouter.post("/parse", uploadCvFile, postParseCv);
cvRouter.post("/anonymize", postAnonymizeCv);
cvRouter.post("/analyze", postAnalyzeCv);

cvRouter.get("/saved", getSavedList);
cvRouter.post("/saved", postSaved);
cvRouter.get("/saved/:id", getSavedItem);
cvRouter.delete("/saved/:id", deleteSavedItem);
