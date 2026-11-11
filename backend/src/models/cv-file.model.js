import { query } from "./db.js";

const LIST_COLUMNS = "id, file_name_enc, mime_type, created_at";

function toCvFile(row) {
  return {
    id: row.id,
    fileNameEnc: row.file_name_enc,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  };
}

export async function listCvFiles(userId) {
  const { rows } = await query(
    `SELECT ${LIST_COLUMNS} FROM cv_files
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(toCvFile);
}

export async function countCvFiles(userId) {
  const { rows } = await query(
    "SELECT count(*)::int AS count FROM cv_files WHERE user_id = $1",
    [userId],
  );
  return rows[0].count;
}

export async function insertCvFile({ userId, fileEnc, fileNameEnc, mimeType }) {
  const { rows } = await query(
    `INSERT INTO cv_files (user_id, file_enc, file_name_enc, mime_type)
     VALUES ($1, $2, $3, $4)
     RETURNING ${LIST_COLUMNS}`,
    [userId, fileEnc, fileNameEnc, mimeType],
  );
  return toCvFile(rows[0]);
}

export async function findCvFileContent(userId, fileId) {
  const { rows } = await query(
    `SELECT file_enc, file_name_enc, mime_type FROM cv_files
     WHERE id = $1 AND user_id = $2`,
    [fileId, userId],
  );
  if (!rows[0]) {
    return null;
  }
  return {
    fileEnc: rows[0].file_enc,
    fileNameEnc: rows[0].file_name_enc,
    mimeType: rows[0].mime_type,
  };
}

export async function deleteCvFile(userId, fileId) {
  const { rowCount } = await query(
    "DELETE FROM cv_files WHERE id = $1 AND user_id = $2",
    [fileId, userId],
  );
  return rowCount > 0;
}
