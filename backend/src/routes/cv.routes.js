import { Router } from "express";
import { uploadCvFile } from "../middleware/upload.middleware.js";
import { postParseCv } from "../controllers/cv.controller.js";

export const cvRouter = Router();

cvRouter.post("/parse", uploadCvFile, postParseCv);
