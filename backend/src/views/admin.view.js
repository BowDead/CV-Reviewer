export function adminUserView(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
  };
}

export function dictionarySkillView(skill) {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    githubLanguage: skill.githubLanguage,
    aliases: skill.aliases,
    caseSensitive: skill.caseSensitive,
    status: skill.status,
  };
}

export function reportView(report) {
  const { invitation } = report;
  return {
    id: report.id,
    reason: report.reason,
    createdAt: report.createdAt,
    resolvedAt: report.resolvedAt,
    reporter: report.reporter,
    invitation: {
      id: invitation.id,
      status: invitation.status,
      position: invitation.position,
      employer: invitation.employer,
      candidate: invitation.candidate,
    },
    messages: report.messages.map((message) => ({
      id: message.id,
      sender:
        message.senderId === invitation.candidateId ? "candidate" : "employer",
      body: message.body,
      createdAt: message.createdAt,
    })),
  };
}
