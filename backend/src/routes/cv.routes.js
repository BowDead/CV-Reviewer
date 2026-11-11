import { Router } from "express";
import { uploadCvFile } from "../middlewares/upload.middleware.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  postParseCv,
  postAnonymizeCv,
  postAnalyzeCv,
} from "../controllers/cv.controller.js";
import {
  deleteFile,
  getFileContent,
  getFiles,
  postFile,
} from "../controllers/cv-file.controller.js";

export const cvRouter = Router();

cvRouter.use(requireAuth, requireRole("candidate", "admin"));

cvRouter.post("/parse", uploadCvFile, postParseCv);
cvRouter.post("/anonymize", postAnonymizeCv);
cvRouter.post("/analyze", postAnalyzeCv);

cvRouter.get("/files", getFiles);
cvRouter.post("/files", uploadCvFile, postFile);
cvRouter.get("/files/:id/content", getFileContent);
cvRouter.delete("/files/:id", deleteFile);
