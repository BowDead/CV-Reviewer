import { query } from "./db.js";

const USER_COLUMNS = "id, email, password_hash, role, created_at";

function toUser(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE email = $1`,
    [email],
  );
  return toUser(rows[0]);
}

export async function findUserById(id) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return toUser(rows[0]);
}

export async function createUser({ email, passwordHash, role, dataKeyEnc }) {
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, role, data_key_enc)
     VALUES ($1, $2, $3, $4)
     RETURNING ${USER_COLUMNS}`,
    [email, passwordHash, role, dataKeyEnc],
  );
  return toUser(rows[0]);
}
