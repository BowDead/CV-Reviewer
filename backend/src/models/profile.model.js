import { query, withTransaction } from "./db.js";

function toProfile(row, skills) {
  return {
    userId: row.user_id,
    sourceAnalysisId: row.source_analysis_id,
    displayName: row.display_name,
    headline: row.headline,
    seniority: row.seniority,
    location: row.location,
    score: row.score === null ? null : Number(row.score),
    isPublished: row.is_published,
    publishedAt: row.published_at,
    skills,
  };
}

async function listProfileSkills(userId) {
  const { rows } = await query(
    `SELECT s.id, s.name, s.category
     FROM profile_skills ps
     JOIN skill_dict s ON s.id = ps.skill_id
     WHERE ps.candidate_id = $1
     ORDER BY s.name`,
    [userId],
  );
  return rows;
}

async function replaceSkills(client, userId, skillIds) {
  await client.query("DELETE FROM profile_skills WHERE candidate_id = $1", [
    userId,
  ]);
  if (skillIds.length > 0) {
    await client.query(
      `INSERT INTO profile_skills (candidate_id, skill_id)
       SELECT $1, unnest($2::int[])
       ON CONFLICT DO NOTHING`,
      [userId, skillIds],
    );
  }
}

export async function findProfile(userId) {
  const { rows } = await query(
    `SELECT user_id, source_analysis_id, display_name, headline, seniority,
            location, score, is_published, published_at
     FROM candidate_profiles
     WHERE user_id = $1`,
    [userId],
  );
  if (!rows[0]) {
    return null;
  }
  return toProfile(rows[0], await listProfileSkills(userId));
}

export function saveProfileFromAnalysis(userId, data) {
  return withTransaction(async (client) => {
    await client.query(
      `INSERT INTO candidate_profiles
         (user_id, source_analysis_id, headline, seniority, location, score)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         source_analysis_id = EXCLUDED.source_analysis_id,
         headline = EXCLUDED.headline,
         seniority = EXCLUDED.seniority,
         location = EXCLUDED.location,
         score = EXCLUDED.score`,
      [
        userId,
        data.analysisId,
        data.headline,
        data.seniority,
        data.location,
        data.score,
      ],
    );
    await replaceSkills(client, userId, data.skillIds);
  });
}

export async function updateProfileFields(userId, fields) {
  await query(
    `UPDATE candidate_profiles
     SET display_name = $2, headline = $3, location = $4
     WHERE user_id = $1`,
    [userId, fields.displayName, fields.headline, fields.location],
  );
}

export function replaceProfileSkills(userId, skillIds) {
  return withTransaction((client) => replaceSkills(client, userId, skillIds));
}

export async function setProfilePublication(userId, published) {
  await query(
    `UPDATE candidate_profiles
     SET is_published = $2,
         published_at = CASE WHEN $2 THEN now() ELSE NULL END
     WHERE user_id = $1`,
    [userId, published],
  );
}
