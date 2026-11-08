import { query } from "./db.js";

const PUBLIC_COLUMNS = "id, provider, model, label, priority, created_at";

function toLlmKey(row) {
  return {
    id: row.id,
    provider: row.provider,
    model: row.model,
    label: row.label,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

export async function listLlmKeys(userId) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM llm_keys WHERE user_id = $1 ORDER BY priority`,
    [userId],
  );
  return rows.map(toLlmKey);
}

export async function findDefaultLlmKey(userId) {
  const { rows } = await query(
    `SELECT provider, model, api_key_enc FROM llm_keys
     WHERE user_id = $1
     ORDER BY priority
     LIMIT 1`,
    [userId],
  );
  if (!rows[0]) {
    return null;
  }
  return {
    provider: rows[0].provider,
    model: rows[0].model,
    apiKeyEnc: rows[0].api_key_enc,
  };
}

export async function insertLlmKey({
  userId,
  provider,
  model,
  label,
  apiKeyEnc,
}) {
  const { rows } = await query(
    `INSERT INTO llm_keys (user_id, provider, model, label, api_key_enc, priority)
     VALUES ($1, $2, $3, $4, $5,
       (SELECT COALESCE(MAX(priority), 0) + 1 FROM llm_keys WHERE user_id = $1))
     RETURNING ${PUBLIC_COLUMNS}`,
    [userId, provider, model, label, apiKeyEnc],
  );
  return toLlmKey(rows[0]);
}

export async function deleteLlmKey(userId, keyId) {
  const { rowCount } = await query(
    "DELETE FROM llm_keys WHERE id = $1 AND user_id = $2",
    [keyId, userId],
  );
  return rowCount > 0;
}

export async function updateLlmKeyOrder(userId, keyIds) {
  await query(
    `UPDATE llm_keys AS k
     SET priority = o.position::int
     FROM unnest($2::uuid[]) WITH ORDINALITY AS o(id, position)
     WHERE k.id = o.id AND k.user_id = $1`,
    [userId, keyIds],
  );
}
