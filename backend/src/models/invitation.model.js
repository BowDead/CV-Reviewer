import { query, withTransaction } from "./db.js";

const SELECT_INVITATION = `
  SELECT i.id, i.status, i.shared_cv_id, i.created_at, i.responded_at,
         i.candidate_id, u.email AS candidate_email,
         pos.id AS position_id, pos.title, pos.description, pos.url,
         pos.employer_id, pos.is_blocked,
         p.display_name, p.headline, p.seniority, p.location, p.score,
         (SELECT max(m.created_at) FROM invitation_messages m
          WHERE m.invitation_id = i.id) AS last_message_at
  FROM invitations i
  JOIN positions pos ON pos.id = i.position_id
  JOIN users u ON u.id = i.candidate_id
  LEFT JOIN candidate_profiles p ON p.user_id = i.candidate_id`;

function toInvitation(row) {
  return {
    id: row.id,
    status: row.status,
    sharedCvId: row.shared_cv_id,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
    lastMessageAt: row.last_message_at,
    employerId: row.employer_id,
    candidateId: row.candidate_id,
    position: {
      id: row.position_id,
      title: row.title,
      description: row.description,
      url: row.url,
      isBlocked: row.is_blocked,
    },
    candidate: {
      id: row.candidate_id,
      email: row.candidate_email,
      displayName: row.display_name,
      headline: row.headline,
      seniority: row.seniority,
      location: row.location,
      score: row.score === null ? null : Number(row.score),
    },
  };
}

function toMessage(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function createInvitation({ positionId, candidateId, senderId, body }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO invitations (position_id, candidate_id)
       VALUES ($1, $2)
       RETURNING id`,
      [positionId, candidateId],
    );
    await client.query(
      `INSERT INTO invitation_messages (invitation_id, sender_id, body)
       VALUES ($1, $2, $3)`,
      [rows[0].id, senderId, body],
    );
    return rows[0].id;
  });
}

export async function findInvitation(invitationId) {
  const { rows } = await query(`${SELECT_INVITATION} WHERE i.id = $1`, [
    invitationId,
  ]);
  return rows[0] ? toInvitation(rows[0]) : null;
}

export async function listInvitationsForPosition(positionId) {
  const { rows } = await query(
    `${SELECT_INVITATION}
     WHERE i.position_id = $1
     ORDER BY i.created_at DESC`,
    [positionId],
  );
  return rows.map(toInvitation);
}

export async function listInvitationsForCandidate(candidateId) {
  const { rows } = await query(
    `${SELECT_INVITATION}
     WHERE i.candidate_id = $1
     ORDER BY last_message_at DESC NULLS LAST, i.created_at DESC`,
    [candidateId],
  );
  return rows.map(toInvitation);
}

export async function answerInvitation({
  invitationId,
  candidateId,
  status,
  sharedCvId,
}) {
  const { rowCount } = await query(
    `UPDATE invitations
     SET status = $3, shared_cv_id = $4, responded_at = now()
     WHERE id = $1 AND candidate_id = $2 AND status = 'pending'`,
    [invitationId, candidateId, status, sharedCvId],
  );
  return rowCount > 0;
}

export async function listMessages(invitationId) {
  const { rows } = await query(
    `SELECT id, sender_id, body, created_at
     FROM invitation_messages
     WHERE invitation_id = $1
     ORDER BY created_at, id`,
    [invitationId],
  );
  return rows.map(toMessage);
}

export async function insertMessage({ invitationId, senderId, body }) {
  await query(
    `INSERT INTO invitation_messages (invitation_id, sender_id, body)
     VALUES ($1, $2, $3)`,
    [invitationId, senderId, body],
  );
}
