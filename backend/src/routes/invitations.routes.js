import { Router } from "express";
import {
  getInvitationThread,
  getReceivedInvitationList,
  getSharedCvFile,
  postInvitationMessage,
  postInvitationResponse,
} from "../controllers/invitation.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

export const invitationsRouter = Router();

const candidateOnly = requireRole("candidate", "admin");

invitationsRouter.use(requireAuth);

invitationsRouter.get("/", candidateOnly, getReceivedInvitationList);
invitationsRouter.post("/:id/respond", candidateOnly, postInvitationResponse);
invitationsRouter.get("/:id/messages", getInvitationThread);
invitationsRouter.post("/:id/messages", postInvitationMessage);
invitationsRouter.get(
  "/:id/cv",
  requireRole("employer", "admin"),
  getSharedCvFile,
);
