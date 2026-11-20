import { escapeLike } from "../utils/escape-like.js";
import { query } from "./db.js";

const USER_COLUMNS = "id, email, password_hash, role, is_blocked, created_at";
const MAX_LISTED_USERS = 100;

function toUser(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    isBlocked: row.is_blocked,
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

export async function findBlockState(userId) {
  const { rows } = await query("SELECT is_blocked FROM users WHERE id = $1", [
    userId,
  ]);
  return rows[0] ? rows[0].is_blocked : null;
}

export async function findDataKeyEnc(userId) {
  const { rows } = await query("SELECT data_key_enc FROM users WHERE id = $1", [
    userId,
  ]);
  return rows[0]?.data_key_enc ?? null;
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

export async function listUsers({ email, role, blocked }) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users
     WHERE ($1::text IS NULL OR email ILIKE '%' || $1 || '%')
       AND ($2::user_role IS NULL OR role = $2)
       AND ($3::boolean IS NULL OR is_blocked = $3)
     ORDER BY created_at DESC
     LIMIT $4`,
    [email ? escapeLike(email) : null, role, blocked, MAX_LISTED_USERS],
  );
  return rows.map(toUser);
}

export async function setUserBlocked(userId, blocked) {
  const { rows } = await query(
    `UPDATE users SET is_blocked = $2 WHERE id = $1
     RETURNING ${USER_COLUMNS}`,
    [userId, blocked],
  );
  return toUser(rows[0]);
}
