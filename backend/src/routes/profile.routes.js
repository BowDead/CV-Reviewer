import { Router } from "express";
import {
  getProfileItem,
  patchProfileFields,
  putProfilePublication,
  putProfileSkills,
  putProfileSource,
} from "../controllers/profile.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const profileRouter = Router();

profileRouter.use(requireAuth, requireRole("candidate", "admin"));

profileRouter.get("/", getProfileItem);
profileRouter.put("/", putProfileSource);
profileRouter.patch("/", patchProfileFields);
profileRouter.put("/skills", putProfileSkills);
profileRouter.put("/publication", putProfilePublication);
