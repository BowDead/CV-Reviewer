import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  answerInvitation,
  createInvitation,
  findInvitation,
  insertMessage,
  listInvitationsForCandidate,
  listInvitationsForEmployer,
  listMessages,
  markInvitationRead,
} from "../models/invitation.model.js";
import { findSavedCv } from "../models/saved-cv.model.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";
import { getCandidate } from "./candidate.service.js";
import { getPosition } from "./position.service.js";
import { readSavedCvContent } from "./saved-cv.service.js";

const UNIQUE_VIOLATION = "23505";
const MAX_MESSAGE = 2000;

const messageText = z
  .string("MESSAGE_REQUIRED")
  .trim()
  .min(1, "MESSAGE_REQUIRED")
  .max(MAX_MESSAGE, "MESSAGE_TOO_LONG");

const inviteSchema = z.object({
  candidateId: z.string("CANDIDATE_NOT_FOUND"),
  message: messageText,
});

const messageSchema = z.object({ text: messageText });

const respondSchema = z.object({
  accept: z.boolean("INVALID_INPUT"),
  cvId: z.string("CV_NOT_FOUND").optional(),
});

async function requireParticipant(userId, invitationId) {
  parseId(invitationId, "INVITATION_NOT_FOUND");
  const invitation = await findInvitation(invitationId);
  if (
    !invitation ||
    (invitation.candidateId !== userId && invitation.employerId !== userId)
  ) {
    throw new HttpError(404, "INVITATION_NOT_FOUND");
  }
  return invitation;
}

export async function inviteCandidate(employerId, positionId, input) {
  const position = await getPosition(employerId, positionId);
  if (position.isBlocked) {
    throw new HttpError(409, "POSITION_BLOCKED");
  }
  const { candidateId, message } = parseInput(inviteSchema, input);
  await getCandidate(candidateId);

  let invitationId;
  try {
    invitationId = await createInvitation({
      positionId,
      candidateId,
      senderId: employerId,
      body: message,
    });
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, "INVITATION_EXISTS");
    }
    throw err;
  }
  return findInvitation(invitationId);
}

export function getInvitations(user) {
  return user.role === "candidate"
    ? listInvitationsForCandidate(user.id)
    : listInvitationsForEmployer(user.id);
}

export async function respondToInvitation(candidateId, invitationId, input) {
  const invitation = await requireParticipant(candidateId, invitationId);
  if (invitation.candidateId !== candidateId) {
    throw new HttpError(404, "INVITATION_NOT_FOUND");
  }
  const { accept, cvId } = parseInput(respondSchema, input);
  if (invitation.status !== "pending") {
    throw new HttpError(409, "INVITATION_ALREADY_ANSWERED");
  }
  if (accept) {
    parseId(cvId, "CV_NOT_FOUND");
    if (!(await findSavedCv(candidateId, cvId))) {
      throw new HttpError(404, "CV_NOT_FOUND");
    }
  }

  const answered = await answerInvitation({
    invitationId,
    candidateId,
    status: accept ? "accepted" : "declined",
    sharedCvId: accept ? cvId : null,
  });
  if (!answered) {
    throw new HttpError(409, "INVITATION_ALREADY_ANSWERED");
  }
  return findInvitation(invitationId);
}

export async function getThread(userId, invitationId) {
  const invitation = await requireParticipant(userId, invitationId);
  const side = invitation.candidateId === userId ? "candidate" : "employer";
  await markInvitationRead(invitationId, side);
  return {
    invitation: await findInvitation(invitationId),
    messages: await listMessages(invitationId),
  };
}

export async function sendMessage(userId, invitationId, input) {
  const invitation = await requireParticipant(userId, invitationId);
  if (invitation.status === "declined") {
    throw new HttpError(409, "INVITATION_CLOSED");
  }
  const { text } = parseInput(messageSchema, input);
  await insertMessage({ invitationId, senderId: userId, body: text });
  return getThread(userId, invitationId);
}

export async function getSharedCv(employerId, invitationId) {
  const invitation = await requireParticipant(employerId, invitationId);
  if (
    invitation.employerId !== employerId ||
    invitation.status !== "accepted" ||
    !invitation.sharedCvId
  ) {
    throw new HttpError(404, "SHARED_CV_NOT_FOUND");
  }
  const content = await readSavedCvContent(
    invitation.candidateId,
    invitation.sharedCvId,
  );
  if (content === null) {
    throw new HttpError(404, "SHARED_CV_NOT_FOUND");
  }
  const name = invitation.candidate.displayName || "kandydat";
  return { content, fileName: `CV - ${name}.md` };
}
