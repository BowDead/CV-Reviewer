import { Router } from "express";
import { uploadCvFile } from "../middlewares/upload.middleware.js";
import { postParseCv } from "../controllers/cv.controller.js";

export const cvRouter = Router();

cvRouter.post("/parse", uploadCvFile, postParseCv);
