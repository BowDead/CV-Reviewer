import { query } from "./db.js";

const SELECT_REPORT = `
  SELECT r.id, r.reason, r.created_at, r.resolved_at,
         r.reporter_id, reporter.email AS reporter_email,
         i.id AS invitation_id, i.status AS invitation_status,
         i.candidate_id, candidate.email AS candidate_email,
         pos.id AS position_id, pos.title AS position_title,
         pos.is_blocked AS position_blocked,
         pos.employer_id, employer.email AS employer_email,
         employer.is_blocked AS employer_blocked
  FROM reports r
  JOIN invitations i ON i.id = r.invitation_id
  JOIN positions pos ON pos.id = i.position_id
  JOIN users employer ON employer.id = pos.employer_id
  JOIN users candidate ON candidate.id = i.candidate_id
  LEFT JOIN users reporter ON reporter.id = r.reporter_id`;

function toReport(row) {
  return {
    id: row.id,
    reason: row.reason,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    reporter: row.reporter_id
      ? { id: row.reporter_id, email: row.reporter_email }
      : null,
    invitation: {
      id: row.invitation_id,
      status: row.invitation_status,
      candidateId: row.candidate_id,
      candidate: { id: row.candidate_id, email: row.candidate_email },
      position: {
        id: row.position_id,
        title: row.position_title,
        isBlocked: row.position_blocked,
      },
      employer: {
        id: row.employer_id,
        email: row.employer_email,
        isBlocked: row.employer_blocked,
      },
    },
  };
}

export async function hasOpenReport(reporterId, invitationId) {
  const { rows } = await query(
    `SELECT 1 FROM reports
     WHERE reporter_id = $1 AND invitation_id = $2 AND resolved_at IS NULL`,
    [reporterId, invitationId],
  );
  return rows.length > 0;
}

export async function insertReport({ reporterId, invitationId, reason }) {
  const { rows } = await query(
    `INSERT INTO reports (reporter_id, invitation_id, reason)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [reporterId, invitationId, reason],
  );
  return rows[0].id;
}

export async function listReports(resolved) {
  const { rows } = await query(
    `${SELECT_REPORT}
     WHERE ($1::boolean IS NULL OR (r.resolved_at IS NOT NULL) = $1)
     ORDER BY r.resolved_at IS NOT NULL, r.created_at`,
    [resolved],
  );
  return rows.map(toReport);
}

export async function findReport(reportId) {
  const { rows } = await query(`${SELECT_REPORT} WHERE r.id = $1`, [reportId]);
  return rows[0] ? toReport(rows[0]) : null;
}

export async function markReportResolved(reportId) {
  const { rowCount } = await query(
    `UPDATE reports SET resolved_at = now()
     WHERE id = $1 AND resolved_at IS NULL`,
    [reportId],
  );
  return rowCount > 0;
}
