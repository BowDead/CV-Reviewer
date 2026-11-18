import { query } from "./db.js";

function toInsight(row) {
  return { comment: row.comment, createdAt: row.created_at };
}

export async function findOfferInsight(analysisId, offerKey) {
  const { rows } = await query(
    `SELECT comment, created_at FROM offer_insights
     WHERE analysis_id = $1 AND solidjobs_offer_key = $2`,
    [analysisId, offerKey],
  );
  return rows[0] ? toInsight(rows[0]) : null;
}

export async function saveOfferInsight({ analysisId, offerKey, comment }) {
  const { rows } = await query(
    `INSERT INTO offer_insights (analysis_id, solidjobs_offer_key, comment)
     VALUES ($1, $2, $3)
     ON CONFLICT (analysis_id, solidjobs_offer_key)
     DO UPDATE SET comment = EXCLUDED.comment, created_at = now()
     RETURNING comment, created_at`,
    [analysisId, offerKey, comment],
  );
  return toInsight(rows[0]);
}
