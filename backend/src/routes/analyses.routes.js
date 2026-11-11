import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  deleteAnalysisItem,
  getAnalysisDetail,
  getAnalysisList,
} from "../controllers/analysis.controller.js";

export const analysesRouter = Router();

analysesRouter.use(requireAuth, requireRole("candidate", "admin"));

analysesRouter.get("/", getAnalysisList);
analysesRouter.get("/:id", getAnalysisDetail);
analysesRouter.delete("/:id", deleteAnalysisItem);
