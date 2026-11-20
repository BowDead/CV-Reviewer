import { escapeLike } from "../utils/escape-like.js";
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

const DICTIONARY_COLUMNS =
  "id, name, category, github_language, aliases, case_sensitive, status";
const MAX_LISTED_SKILLS = 200;

function toDictionarySkill(row) {
  return { ...toSkill(row), status: row.status };
}

export async function listDictionarySkills({ status, search, category }) {
  const { rows } = await query(
    `SELECT ${DICTIONARY_COLUMNS} FROM skill_dict
     WHERE ($1::skill_status IS NULL OR status = $1)
       AND ($2::text IS NULL
            OR name ILIKE '%' || $2 || '%'
            OR aliases::text ILIKE '%' || $2 || '%')
       AND ($3::text IS NULL OR category = $3)
     ORDER BY status = 'pending' DESC, name
     LIMIT $4`,
    [status, search ? escapeLike(search) : null, category, MAX_LISTED_SKILLS],
  );
  return rows.map(toDictionarySkill);
}

export async function findDictionarySkill(skillId) {
  const { rows } = await query(
    `SELECT ${DICTIONARY_COLUMNS} FROM skill_dict WHERE id = $1`,
    [skillId],
  );
  return rows[0] ? toDictionarySkill(rows[0]) : null;
}

export async function insertDictionarySkill(skill) {
  const { rows } = await query(
    `INSERT INTO skill_dict
       (name, category, github_language, aliases, case_sensitive, status)
     VALUES ($1, $2, $3, $4, $5, 'approved')
     RETURNING ${DICTIONARY_COLUMNS}`,
    [
      skill.name,
      skill.category,
      skill.githubLanguage,
      JSON.stringify(skill.aliases),
      skill.caseSensitive,
    ],
  );
  return toDictionarySkill(rows[0]);
}

export async function updateDictionarySkill(skillId, skill) {
  const { rows } = await query(
    `UPDATE skill_dict
     SET name = $2, category = $3, github_language = $4, aliases = $5,
         case_sensitive = $6, status = $7
     WHERE id = $1
     RETURNING ${DICTIONARY_COLUMNS}`,
    [
      skillId,
      skill.name,
      skill.category,
      skill.githubLanguage,
      JSON.stringify(skill.aliases),
      skill.caseSensitive,
      skill.status,
    ],
  );
  return rows[0] ? toDictionarySkill(rows[0]) : null;
}
