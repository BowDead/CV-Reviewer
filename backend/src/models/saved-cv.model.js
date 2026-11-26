import { query } from "./db.js";

const LIST_COLUMNS = "id, name, source, created_at";

function toSavedCv(row) {
  return {
    id: row.id,
    name: row.name,
    source: row.source,
    createdAt: row.created_at,
  };
}

export async function listSavedCvs(userId) {
  const { rows } = await query(
    `SELECT ${LIST_COLUMNS} FROM cvs
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toSavedCv);
}

export async function countSavedCvs(userId) {
  const { rows } = await query(
    "SELECT count(*)::int AS count FROM cvs WHERE user_id = $1",
    [userId],
  );
  return rows[0].count;
}

export async function insertSavedCv({ userId, name, content, source }) {
  const { rows } = await query(
    `INSERT INTO cvs (user_id, name, content, source)
     VALUES ($1, $2, $3, $4)
     RETURNING ${LIST_COLUMNS}`,
    [userId, name, content, source],
  );
  return toSavedCv(rows[0]);
}

export async function findSavedCv(userId, cvId) {
  const { rows } = await query(
    `SELECT ${LIST_COLUMNS}, content FROM cvs
     WHERE id = $1 AND user_id = $2`,
    [cvId, userId],
  );
  if (!rows[0]) {
    return null;
  }
  return { ...toSavedCv(rows[0]), content: rows[0].content };
}

export async function deleteSavedCv(userId, cvId) {
  const { rowCount } = await query(
    "DELETE FROM cvs WHERE id = $1 AND user_id = $2",
    [cvId, userId],
  );
  return rowCount > 0;
}
