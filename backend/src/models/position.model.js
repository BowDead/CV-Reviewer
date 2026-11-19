import { query, withTransaction } from "./db.js";

const COLUMNS =
  "id, employer_id, title, description, url, is_blocked, created_at, updated_at";

function toPosition(row, skills) {
  return {
    id: row.id,
    employerId: row.employer_id,
    title: row.title,
    description: row.description,
    url: row.url,
    isBlocked: row.is_blocked,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    skills,
  };
}

async function listSkillsFor(positionIds) {
  if (positionIds.length === 0) {
    return new Map();
  }
  const { rows } = await query(
    `SELECT ps.position_id, ps.is_required, s.id, s.name, s.category
     FROM position_skills ps
     JOIN skill_dict s ON s.id = ps.skill_id
     WHERE ps.position_id = ANY($1::uuid[])
     ORDER BY ps.is_required DESC, s.name`,
    [positionIds],
  );
  const skills = new Map(positionIds.map((id) => [id, []]));
  for (const row of rows) {
    skills.get(row.position_id).push({
      id: row.id,
      name: row.name,
      category: row.category,
      isRequired: row.is_required,
    });
  }
  return skills;
}

async function withSkills(rows) {
  const skills = await listSkillsFor(rows.map((row) => row.id));
  return rows.map((row) => toPosition(row, skills.get(row.id)));
}

async function replaceSkills(client, positionId, skills) {
  await client.query("DELETE FROM position_skills WHERE position_id = $1", [
    positionId,
  ]);
  if (skills.length > 0) {
    await client.query(
      `INSERT INTO position_skills (position_id, skill_id, is_required)
       SELECT $1, unnest($2::int[]), unnest($3::boolean[])`,
      [
        positionId,
        skills.map((skill) => skill.skillId),
        skills.map((skill) => skill.isRequired),
      ],
    );
  }
}

export async function listPositions(employerId) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM positions
     WHERE employer_id = $1
     ORDER BY updated_at DESC`,
    [employerId],
  );
  return withSkills(rows);
}

export async function findPosition(employerId, positionId) {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM positions
     WHERE id = $1 AND employer_id = $2`,
    [positionId, employerId],
  );
  return rows[0] ? (await withSkills(rows))[0] : null;
}

export function insertPosition(employerId, data) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO positions (employer_id, title, description, url)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [employerId, data.title, data.description, data.url],
    );
    await replaceSkills(client, rows[0].id, data.skills);
    return rows[0].id;
  });
}

export function updatePosition(employerId, positionId, data) {
  return withTransaction(async (client) => {
    const { rowCount } = await client.query(
      `UPDATE positions
       SET title = $3, description = $4, url = $5, updated_at = now()
       WHERE id = $1 AND employer_id = $2`,
      [positionId, employerId, data.title, data.description, data.url],
    );
    if (rowCount === 0) {
      return false;
    }
    await replaceSkills(client, positionId, data.skills);
    return true;
  });
}

export async function deletePosition(employerId, positionId) {
  const { rowCount } = await query(
    "DELETE FROM positions WHERE id = $1 AND employer_id = $2",
    [positionId, employerId],
  );
  return rowCount > 0;
}
