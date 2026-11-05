import { Router } from "express";
import { uploadCvFile } from "../middlewares/upload.middleware.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { postParseCv, postAnalyzeCv } from "../controllers/cv.controller.js";

export const cvRouter = Router();

cvRouter.use(requireAuth, requireRole("candidate", "admin"));

cvRouter.post("/parse", uploadCvFile, postParseCv);
cvRouter.post("/analyze", postAnalyzeCv);
