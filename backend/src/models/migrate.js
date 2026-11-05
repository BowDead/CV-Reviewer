import { readdir, readFile } from "node:fs/promises";
import { pool } from "./db.js";

const MIGRATIONS_DIR = new URL("./migrations/", import.meta.url);

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       text        PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((row) => row.name));

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        continue;
      }

      const sql = await readFile(new URL(file, MIGRATIONS_DIR), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");
        console.log(`Migracja wykonana: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migracja ${file} nie powiodła się: ${err.message}`, {
          cause: err,
        });
      }
    }
  } finally {
    client.release();
  }
}
