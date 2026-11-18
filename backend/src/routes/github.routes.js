import { Router } from "express";
import {
  deleteGithubAccount,
  getRepositoryList,
  postRepositoryAnalysis,
  putGithubAccount,
} from "../controllers/github.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const githubRouter = Router();

githubRouter.use(requireAuth, requireRole("candidate", "admin"));

githubRouter.put("/account", putGithubAccount);
githubRouter.delete("/account", deleteGithubAccount);
githubRouter.get("/repositories", getRepositoryList);
githubRouter.post("/repositories/analyze", postRepositoryAnalysis);
