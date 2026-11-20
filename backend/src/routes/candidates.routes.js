import { Router } from "express";
import {
  getCandidateItem,
  getCandidateList,
} from "../controllers/candidate.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const candidatesRouter = Router();

candidatesRouter.use(requireAuth, requireRole("employer", "admin"));

candidatesRouter.get("/", getCandidateList);
candidatesRouter.get("/:id", getCandidateItem);
