import { Router } from "express";
import {
  getSkillList,
  getUserList,
  patchSkill,
  postSkill,
  putPositionBlock,
  putUserBlock,
} from "../controllers/admin.controller.js";
import {
  getReportList,
  postReportResolution,
} from "../controllers/report.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/reports", getReportList);
adminRouter.post("/reports/:id/resolve", postReportResolution);
adminRouter.get("/users", getUserList);
adminRouter.put("/users/:id/block", putUserBlock);
adminRouter.put("/positions/:id/block", putPositionBlock);
adminRouter.get("/skills", getSkillList);
adminRouter.post("/skills", postSkill);
adminRouter.patch("/skills/:id", patchSkill);
