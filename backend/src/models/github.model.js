import { query, withTransaction } from "./db.js";

function toRepository(row) {
  return {
    id: row.id,
    githubRepoId: Number(row.github_repo_id),
    dataEnc: row.data_enc,
    pushedAt: row.pushed_at,
    status: row.status,
    analyzedAt: row.analyzed_at,
    skills: row.skills ?? [],
  };
}

export async function findGithubLoginEnc(userId) {
  const { rows } = await query(
    "SELECT github_login_enc FROM users WHERE id = $1",
    [userId],
  );
  return rows[0]?.github_login_enc ?? null;
}

export async function updateGithubLogin(userId, loginEnc, clearRepositories) {
  await withTransaction(async (client) => {
    await client.query("UPDATE users SET github_login_enc = $2 WHERE id = $1", [
      userId,
      loginEnc,
    ]);
    if (clearRepositories) {
      await client.query("DELETE FROM user_repositories WHERE user_id = $1", [
        userId,
      ]);
    }
  });
}

export async function listRepositories(userId) {
  const { rows } = await query(
    `SELECT r.id, r.github_repo_id, r.data_enc, r.pushed_at, r.status, r.analyzed_at,
       COALESCE(
         json_agg(
           json_build_object(
             'id', s.id, 'name', s.name, 'category', s.category, 'source', rs.source
           ) ORDER BY s.id
         ) FILTER (WHERE s.id IS NOT NULL),
         '[]'
       ) AS skills
     FROM user_repositories r
     LEFT JOIN repository_skills rs ON rs.repository_id = r.id
     LEFT JOIN skill_dict s ON s.id = rs.skill_id
     WHERE r.user_id = $1
     GROUP BY r.id
     ORDER BY r.pushed_at DESC`,
    [userId],
  );
  return rows.map(toRepository);
}

export async function listRepositoryStates(userId) {
  const { rows } = await query(
    `SELECT github_repo_id, pushed_at, status FROM user_repositories
     WHERE user_id = $1`,
    [userId],
  );
  return rows.map(toRepository);
}

export async function upsertRepository({
  userId,
  githubRepoId,
  dataEnc,
  pushedAt,
}) {
  await query(
    `INSERT INTO user_repositories (user_id, github_repo_id, data_enc, pushed_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, github_repo_id) DO UPDATE
     SET data_enc = EXCLUDED.data_enc,
         pushed_at = EXCLUDED.pushed_at,
         status = 'pending'`,
    [userId, githubRepoId, dataEnc, pushedAt],
  );
}

export async function deleteMissingRepositories(userId, githubRepoIds) {
  await query(
    `DELETE FROM user_repositories
     WHERE user_id = $1 AND NOT (github_repo_id = ANY($2::bigint[]))`,
    [userId, githubRepoIds],
  );
}

export async function listRepositoriesToAnalyze(userId, limit) {
  const { rows } = await query(
    `SELECT id, github_repo_id, data_enc, pushed_at, status, analyzed_at
     FROM user_repositories
     WHERE user_id = $1 AND status <> 'done'
     ORDER BY pushed_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return rows.map(toRepository);
}

export async function countPendingRepositories(userId) {
  const { rows } = await query(
    `SELECT count(*)::int AS count FROM user_repositories
     WHERE user_id = $1 AND status = 'pending'`,
    [userId],
  );
  return rows[0].count;
}

export async function saveRepositoryAnalysis(repositoryId, dataEnc, skills) {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE user_repositories
       SET data_enc = $2, status = 'done', analyzed_at = now()
       WHERE id = $1`,
      [repositoryId, dataEnc],
    );
    await client.query(
      "DELETE FROM repository_skills WHERE repository_id = $1",
      [repositoryId],
    );
    if (skills.length > 0) {
      await client.query(
        `INSERT INTO repository_skills (repository_id, skill_id, source)
         SELECT $1, skill_id, source::skill_source
         FROM unnest($2::int[], $3::text[]) AS t(skill_id, source)`,
        [
          repositoryId,
          skills.map((skill) => skill.skillId),
          skills.map((skill) => skill.source),
        ],
      );
    }
  });
}

export async function markRepositoriesFailed(repositoryIds) {
  await query(
    "UPDATE user_repositories SET status = 'failed' WHERE id = ANY($1::uuid[])",
    [repositoryIds],
  );
}
