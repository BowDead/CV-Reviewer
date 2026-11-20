const PREVIEW_LENGTH = 140;

function preview(body) {
  const text = body.replace(/\s+/g, " ").trim();
  return text.length > PREVIEW_LENGTH
    ? `${text.slice(0, PREVIEW_LENGTH - 1)}…`
    : text;
}

function isUnread(lastMessage, viewerId, readAt) {
  if (!lastMessage || lastMessage.senderId === viewerId) {
    return false;
  }
  return !readAt || new Date(lastMessage.createdAt) > new Date(readAt);
}

export function invitationView(invitation, viewerId) {
  const isCandidate = invitation.candidateId === viewerId;
  const showEmail = !isCandidate && invitation.status === "accepted";
  const readAt = isCandidate
    ? invitation.candidateReadAt
    : invitation.employerReadAt;
  const { lastMessage } = invitation;
  return {
    id: invitation.id,
    role: isCandidate ? "candidate" : "employer",
    status: invitation.status,
    canWrite: invitation.status !== "declined",
    hasSharedCv: Boolean(invitation.sharedCvId),
    sharedCvId: isCandidate ? invitation.sharedCvId : null,
    createdAt: invitation.createdAt,
    respondedAt: invitation.respondedAt,
    lastMessageAt: lastMessage?.createdAt ?? null,
    lastMessage: lastMessage
      ? {
          preview: preview(lastMessage.body),
          isMine: lastMessage.senderId === viewerId,
          createdAt: lastMessage.createdAt,
        }
      : null,
    unread: isUnread(lastMessage, viewerId, readAt),
    position: invitation.position,
    candidate: {
      id: invitation.candidate.id,
      displayName: invitation.candidate.displayName,
      headline: invitation.candidate.headline,
      seniority: invitation.candidate.seniority,
      location: invitation.candidate.location,
      score: invitation.candidate.score,
      email: showEmail ? invitation.candidate.email : null,
    },
  };
}

export function messageView(message, invitation, viewerId) {
  return {
    id: message.id,
    sender:
      message.senderId === invitation.candidateId ? "candidate" : "employer",
    isMine: message.senderId === viewerId,
    body: message.body,
    createdAt: message.createdAt,
  };
}

export function threadView({ invitation, messages }, viewerId) {
  return {
    invitation: invitationView(invitation, viewerId),
    messages: messages.map((message) =>
      messageView(message, invitation, viewerId),
    ),
  };
}
