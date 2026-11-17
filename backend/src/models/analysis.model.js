import { query } from "./db.js";

const COLUMNS = `a.id, a.cv_id, a.model, a.language, a.created_at,
  (a.result->'analysis'->>'overallScore')::float8 AS overall_score,
  a.result->'analysis'->>'seniority' AS seniority,
  EXISTS (
    SELECT 1 FROM candidate_profiles p WHERE p.source_analysis_id = a.id
  ) AS is_profile_source`;

function toAnalysis(row) {
  return {
    id: row.id,
    cvId: row.cv_id,
    model: row.model,
    language: row.language,
    overallScore: row.overall_score,
    seniority: row.seniority || null,
    result: row.result,
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
    `SELECT ${COLUMNS}, a.result FROM analyses a
     WHERE a.id = $1 AND a.user_id = $2`,
    [analysisId, userId],
  );
  return rows[0] ? toAnalysis(rows[0]) : null;
}

export async function findLatestAnalysisForCv(userId, cvId) {
  const { rows } = await query(
    `SELECT ${COLUMNS}, a.result FROM analyses a
     WHERE a.user_id = $1 AND a.cv_id = $2
     ORDER BY a.created_at DESC
     LIMIT 1`,
    [userId, cvId],
  );
  return rows[0] ? toAnalysis(rows[0]) : null;
}

export async function insertAnalysis({
  userId,
  cvId,
  model,
  language,
  result,
}) {
  const { rows } = await query(
    `INSERT INTO analyses (user_id, cv_id, model, language, result)
     VALUES (
       $1,
       (SELECT id FROM cvs WHERE id = $2 AND user_id = $1),
       $3, $4, $5
     )
     RETURNING id`,
    [userId, cvId, model, language, JSON.stringify(result)],
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
