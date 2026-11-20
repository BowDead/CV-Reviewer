import { Router } from "express";
import {
  getInvitationList,
  getInvitationThread,
  getSharedCvFile,
  postInvitationMessage,
  postInvitationResponse,
} from "../controllers/invitation.controller.js";
import { postInvitationReport } from "../controllers/report.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const invitationsRouter = Router();

const candidateOnly = requireRole("candidate", "admin");

invitationsRouter.use(requireAuth);

invitationsRouter.get("/", getInvitationList);
invitationsRouter.post("/:id/respond", candidateOnly, postInvitationResponse);
invitationsRouter.post("/:id/report", candidateOnly, postInvitationReport);
invitationsRouter.get("/:id/messages", getInvitationThread);
invitationsRouter.post("/:id/messages", postInvitationMessage);
invitationsRouter.get(
  "/:id/cv",
  requireRole("employer", "admin"),
  getSharedCvFile,
);
