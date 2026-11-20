import { request } from "@/shared/api/httpClient";

function invitationPath(invitationId) {
  return `/invitations/${encodeURIComponent(invitationId)}`;
}

export function fetchReceivedInvitations(signal) {
  return request("/invitations", { signal });
}

export function fetchPositionInvitations(positionId, signal) {
  return request(`/positions/${encodeURIComponent(positionId)}/invitations`, {
    signal,
  });
}

export function inviteCandidate(positionId, body) {
  return request(`/positions/${encodeURIComponent(positionId)}/invitations`, {
    method: "POST",
    body,
  });
}

export function fetchThread(invitationId, signal) {
  return request(`${invitationPath(invitationId)}/messages`, { signal });
}

export function postMessage(invitationId, text) {
  return request(`${invitationPath(invitationId)}/messages`, {
    method: "POST",
    body: { text },
  });
}

export function respondToInvitation(invitationId, body) {
  return request(`${invitationPath(invitationId)}/respond`, {
    method: "POST",
    body,
  });
}

export function sharedCvUrl(invitationId) {
  return `/api${invitationPath(invitationId)}/cv`;
}

export function fetchSavedCvs(signal) {
  return request("/cv/saved", { signal });
}
