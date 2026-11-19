import { query } from "./db.js";

function toSkill(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    aliases: row.aliases,
    githubLanguage: row.github_language,
    caseSensitive: row.case_sensitive,
  };
}

export async function listApprovedSkills() {
  const { rows } = await query(
    `SELECT id, name, category, aliases, github_language, case_sensitive
     FROM skill_dict
     WHERE status = 'approved'
     ORDER BY id`,
  );
  return rows.map(toSkill);
}

export async function insertPendingSkills(names) {
  await query(
    `INSERT INTO skill_dict (name)
     SELECT unnest($1::varchar[])
     ON CONFLICT DO NOTHING`,
    [names],
  );
}

export async function findApprovedSkillIdsByNames(names) {
  if (names.length === 0) {
    return [];
  }
  const { rows } = await query(
    `SELECT id FROM skill_dict
     WHERE status = 'approved' AND lower(name) = ANY($1::text[])`,
    [names.map((name) => name.toLowerCase())],
  );
  return rows.map((row) => row.id);
}

export async function countApprovedSkills(ids) {
  if (ids.length === 0) {
    return 0;
  }
  const { rows } = await query(
    `SELECT count(*)::int AS count FROM skill_dict
     WHERE status = 'approved' AND id = ANY($1::int[])`,
    [ids],
  );
  return rows[0].count;
}
