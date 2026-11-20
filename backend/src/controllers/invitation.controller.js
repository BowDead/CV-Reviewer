import {
  getInvitations,
  getSharedCv,
  getThread,
  inviteCandidate,
  respondToInvitation,
  sendMessage,
} from "../services/invitation.service.js";
import { invitationView, threadView } from "../views/invitation.view.js";

export async function postInvitation(req, res) {
  const invitation = await inviteCandidate(
    req.user.id,
    req.params.id,
    req.body,
  );
  res.status(201).json(invitationView(invitation, req.user.id));
}

export async function getInvitationList(req, res) {
  const invitations = await getInvitations(req.user);
  res.json({
    invitations: invitations.map((item) => invitationView(item, req.user.id)),
  });
}

export async function postInvitationResponse(req, res) {
  const invitation = await respondToInvitation(
    req.user.id,
    req.params.id,
    req.body,
  );
  res.json(invitationView(invitation, req.user.id));
}

export async function getInvitationThread(req, res) {
  const thread = await getThread(req.user.id, req.params.id);
  res.json(threadView(thread, req.user.id));
}

export async function postInvitationMessage(req, res) {
  const thread = await sendMessage(req.user.id, req.params.id, req.body);
  res.status(201).json(threadView(thread, req.user.id));
}

export async function getSharedCvFile(req, res) {
  const { content, fileName } = await getSharedCv(req.user.id, req.params.id);
  res.attachment(fileName);
  res.type("text/markdown; charset=utf-8");
  res.send(content);
}
