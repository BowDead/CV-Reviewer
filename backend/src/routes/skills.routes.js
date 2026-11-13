import { Router } from "express";
import { getSkills } from "../controllers/skill.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const skillsRouter = Router();

skillsRouter.use(requireAuth);

skillsRouter.get("/", getSkills);
