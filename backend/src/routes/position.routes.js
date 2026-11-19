import { Router } from "express";
import {
  deletePositionItem,
  getPositionItem,
  getPositionList,
  postPosition,
  postSkillSuggestion,
  putPosition,
} from "../controllers/position.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const positionsRouter = Router();

positionsRouter.use(requireAuth, requireRole("employer", "admin"));

positionsRouter.get("/", getPositionList);
positionsRouter.post("/", postPosition);
positionsRouter.post("/skill-suggestions", postSkillSuggestion);
positionsRouter.get("/:id", getPositionItem);
positionsRouter.put("/:id", putPosition);
positionsRouter.delete("/:id", deletePositionItem);
