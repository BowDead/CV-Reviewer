import { escapeLike } from "../utils/escape-like.js";
import { query } from "./db.js";

const COLUMNS = `p.user_id, p.display_name, p.headline, p.seniority, p.location,
  p.score, p.published_at`;

const PUBLISHED = `p.is_published AND NOT u.is_blocked`;

function toCandidate(row, skills) {
  return {
    id: row.user_id,
    displayName: row.display_name,
    headline: row.headline,
    seniority: row.seniority,
    location: row.location,
    score: row.score === null ? null : Number(row.score),
    publishedAt: row.published_at,
    skills,
  };
}

async function withSkills(rows) {
  if (rows.length === 0) {
    return [];
  }
  const { rows: skillRows } = await query(
    `SELECT ps.candidate_id, s.id, s.name, s.category
     FROM profile_skills ps
     JOIN skill_dict s ON s.id = ps.skill_id
     WHERE ps.candidate_id = ANY($1::uuid[])
     ORDER BY s.name`,
    [rows.map((row) => row.user_id)],
  );
  const skills = new Map(rows.map((row) => [row.user_id, []]));
  for (const row of skillRows) {
    skills.get(row.candidate_id).push({
      id: row.id,
      name: row.name,
      category: row.category,
    });
  }
  return rows.map((row) => toCandidate(row, skills.get(row.user_id)));
}

export async function searchCandidates({
  skillIds,
  seniority,
  location,
  limit,
}) {
  const { rows } = await query(
    `SELECT ${COLUMNS}
     FROM candidate_profiles p
     JOIN users u ON u.id = p.user_id
     WHERE ${PUBLISHED}
       AND ($1::seniority_level IS NULL OR p.seniority = $1)
       AND ($2::text IS NULL OR p.location ILIKE '%' || $2 || '%')
       AND (
         cardinality($3::int[]) = 0
         OR (
           SELECT count(*) FROM profile_skills ps
           WHERE ps.candidate_id = p.user_id AND ps.skill_id = ANY($3)
         ) = cardinality($3)
       )
     ORDER BY p.published_at DESC
     LIMIT $4`,
    [seniority, location ? escapeLike(location) : null, skillIds, limit],
  );
  return withSkills(rows);
}

export async function findPublishedCandidate(candidateId) {
  const { rows } = await query(
    `SELECT ${COLUMNS}
     FROM candidate_profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1 AND ${PUBLISHED}`,
    [candidateId],
  );
  return rows[0] ? (await withSkills(rows))[0] : null;
}
