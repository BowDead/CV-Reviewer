import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSkillDictionary } from "@/features/profile";
import { Button } from "@/shared/ui/Button";
import { LIMITS } from "../utils/creatorForm";
import styles from "./CvCreator.module.scss";

export function CreatorSkills({ skills, disabled, onChange }) {
  const { t } = useTranslation();
  const dictionary = useSkillDictionary();
  const listId = useId();
  const [query, setQuery] = useState("");

  const taken = skills.map((skill) => skill.toLowerCase());
  const available = dictionary.filter(
    (skill) => !taken.includes(skill.name.toLowerCase()),
  );
  const full = skills.length >= LIMITS.skills;

  function add() {
    const typed = query.trim();
    if (!typed || full) return;
    const known = dictionary.find(
      (skill) => skill.name.toLowerCase() === typed.toLowerCase(),
    );
    const name = known ? known.name : typed;
    if (!taken.includes(name.toLowerCase())) {
      onChange([...skills, name]);
    }
    setQuery("");
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.label}>{t("cvCreator.skills.title")}</h2>
      {skills.length > 0 ? (
        <ul className={styles.tags}>
          {skills.map((skill) => (
            <li key={skill} className={styles.tag}>
              {skill}
              <button
                type="button"
                className={styles.tagButton}
                disabled={disabled}
                aria-label={t("cvCreator.skills.remove", { name: skill })}
                onClick={() =>
                  onChange(skills.filter((item) => item !== skill))
                }
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.hint}>{t("cvCreator.skills.empty")}</p>
      )}
      <div className={styles.add}>
        <input
          className={styles.input}
          list={listId}
          value={query}
          maxLength={100}
          disabled={disabled || full}
          placeholder={t("cvCreator.skills.placeholder")}
          aria-label={t("cvCreator.skills.placeholder")}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <datalist id={listId}>
          {available.map((skill) => (
            <option key={skill.id} value={skill.name} />
          ))}
        </datalist>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || full || !query.trim()}
          onClick={add}
        >
          {t("cvCreator.skills.add")}
        </Button>
      </div>
      <p className={styles.hint}>{t("cvCreator.skills.hint")}</p>
    </section>
  );
}
