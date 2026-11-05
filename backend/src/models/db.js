import pg from "pg";
import { env } from "../config/env.js";

export const pool = new pg.Pool({ connectionString: env.databaseUrl });

pool.on("error", (err) => {
  console.error("Błąd nieaktywnego połączenia z bazą:", err);
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function isDatabaseReachable() {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
