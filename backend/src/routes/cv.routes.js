import { Router } from "express";
import { uploadCvFile } from "../middlewares/upload.middleware.js";
import { postParseCv, postAnalyzeCv } from "../controllers/cv.controller.js";

export const cvRouter = Router();

cvRouter.post("/parse", uploadCvFile, postParseCv);
cvRouter.post("/analyze", postAnalyzeCv);
