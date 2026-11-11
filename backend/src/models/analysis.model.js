import { query } from "./db.js";

const COLUMNS = `a.id, a.cv_file_id, a.model, a.language, a.result_enc, a.created_at,
  EXISTS (
    SELECT 1 FROM candidate_profiles p WHERE p.source_analysis_id = a.id
  ) AS is_profile_source`;

function toAnalysis(row) {
  return {
    id: row.id,
    cvFileId: row.cv_file_id,
    model: row.model,
    language: row.language,
    resultEnc: row.result_enc,
    isProfileSource: row.is_profile_source,
    createdAt: row.created_at,
  };
}

export async function listAnalyses(userId) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM analyses a
     WHERE a.user_id = $1
     ORDER BY a.created_at DESC`,
    [userId],
  );
  return rows.map(toAnalysis);
}

export async function findAnalysis(userId, analysisId) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM analyses a
     WHERE a.id = $1 AND a.user_id = $2`,
    [analysisId, userId],
  );
  return rows[0] ? toAnalysis(rows[0]) : null;
}

export async function insertAnalysis({
  userId,
  cvFileId,
  model,
  language,
  resultEnc,
}) {
  const { rows } = await query(
    `INSERT INTO analyses (user_id, cv_file_id, model, language, result_enc)
     VALUES (
       $1,
       (SELECT id FROM cv_files WHERE id = $2 AND user_id = $1),
       $3, $4, $5
     )
     RETURNING id`,
    [userId, cvFileId, model, language, resultEnc],
  );
  return rows[0].id;
}

export async function deleteAnalysis(userId, analysisId) {
  const { rowCount } = await query(
    "DELETE FROM analyses WHERE id = $1 AND user_id = $2",
    [analysisId, userId],
  );
  return rowCount > 0;
}
