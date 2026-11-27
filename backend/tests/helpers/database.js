import { pool } from "../../src/models/db.js";
import { runMigrations } from "../../src/models/migrate.js";

async function requireTestDatabase() {
  const { rows } = await pool.query("SELECT current_database() AS name");
  if (!rows[0].name.endsWith("_test")) {
    throw new Error("Testy integracyjne działają tylko na bazie testowej.");
  }
}

export async function createSchema() {
  await requireTestDatabase();
  await pool.query("DROP SCHEMA public CASCADE");
  await pool.query("CREATE SCHEMA public");
  await runMigrations();
}

export async function clearData() {
  await pool.query("TRUNCATE users CASCADE");
}

export async function closeDatabase() {
  await pool.end();
}

export async function selectRows(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows;
}
