import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import { useSkillDictionary } from "../hooks/useSkillDictionary";
import styles from "./Profile.module.scss";

export function ProfileSkillsEditor({ skills, saving, onChange }) {
  const { t } = useTranslation();
  const dictionary = useSkillDictionary();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);

  const ids = skills.map((skill) => skill.id);
  const available = dictionary.filter((skill) => !ids.includes(skill.id));

  async function handleAdd(event) {
    event.preventDefault();
    const name = query.trim().toLowerCase();
    const skill = available.find((item) => item.name.toLowerCase() === name);
    if (!skill) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    if (await onChange([...ids, skill.id])) {
      setQuery("");
    }
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.label}>{t("candidateProfile.skillsTitle")}</h2>
      {skills.length > 0 ? (
        <ul className={styles.tags}>
          {skills.map((skill) => (
            <li key={skill.id} className={styles.tag}>
              {skill.name}
              <button
                type="button"
                className={styles.remove}
                disabled={saving}
                aria-label={t("candidateProfile.removeSkill", {
                  name: skill.name,
                })}
                onClick={() => onChange(ids.filter((id) => id !== skill.id))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.hint}>{t("candidateProfile.noSkills")}</p>
      )}

      <form className={styles.add} onSubmit={handleAdd}>
        <input
          id="profile-skill"
          className={styles.input}
          list={listId}
          value={query}
          placeholder={t("candidateProfile.addSkillPlaceholder")}
          aria-label={t("candidateProfile.addSkillPlaceholder")}
          onChange={(event) => {
            setQuery(event.target.value);
            setNotFound(false);
          }}
        />
        <datalist id={listId}>
          {available.map((skill) => (
            <option key={skill.id} value={skill.name} />
          ))}
        </datalist>
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={!query.trim() || saving}
        >
          {t("candidateProfile.addSkill")}
        </Button>
      </form>
      {notFound && (
        <p className={styles.error}>{t("candidateProfile.skillNotFound")}</p>
      )}
    </section>
  );
}
