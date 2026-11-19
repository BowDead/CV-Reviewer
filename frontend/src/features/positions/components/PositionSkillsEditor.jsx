import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSkillDictionary } from "@/features/profile";
import { Button } from "@/shared/ui/Button";
import styles from "./Positions.module.scss";

function SkillGroup({ title, skills, disabled, onToggle, onRemove }) {
  const { t } = useTranslation();

  return (
    <div className={styles.skillGroup}>
      <span className={styles.groupTitle}>{title}</span>
      {skills.length > 0 ? (
        <ul className={styles.tags}>
          {skills.map((skill) => (
            <li key={skill.id} className={styles.tag}>
              {skill.name}
              <button
                type="button"
                className={styles.tagButton}
                disabled={disabled}
                title={t(
                  skill.isRequired
                    ? "positions.form.moveToNice"
                    : "positions.form.moveToRequired",
                  { name: skill.name },
                )}
                aria-label={t(
                  skill.isRequired
                    ? "positions.form.moveToNice"
                    : "positions.form.moveToRequired",
                  { name: skill.name },
                )}
                onClick={() => onToggle(skill.id)}
              >
                ⇄
              </button>
              <button
                type="button"
                className={styles.tagButton}
                disabled={disabled}
                aria-label={t("positions.form.removeSkill", {
                  name: skill.name,
                })}
                onClick={() => onRemove(skill.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <span className={styles.hint}>{t("positions.form.noSkills")}</span>
      )}
    </div>
  );
}

export function PositionSkillsEditor({ skills, disabled, onChange }) {
  const { t } = useTranslation();
  const dictionary = useSkillDictionary();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const ids = skills.map((skill) => skill.id);
  const available = dictionary.filter((skill) => !ids.includes(skill.id));

  function add() {
    const name = query.trim().toLowerCase();
    const skill = available.find((item) => item.name.toLowerCase() === name);
    if (!skill) {
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setQuery("");
    onChange([...skills, { ...skill, isRequired }]);
  }

  function toggle(skillId) {
    onChange(
      skills.map((skill) =>
        skill.id === skillId
          ? { ...skill, isRequired: !skill.isRequired }
          : skill,
      ),
    );
  }

  function remove(skillId) {
    onChange(skills.filter((skill) => skill.id !== skillId));
  }

  return (
    <div className={styles.skills}>
      <SkillGroup
        title={t("positions.form.required")}
        skills={skills.filter((skill) => skill.isRequired)}
        disabled={disabled}
        onToggle={toggle}
        onRemove={remove}
      />
      <SkillGroup
        title={t("positions.form.niceToHave")}
        skills={skills.filter((skill) => !skill.isRequired)}
        disabled={disabled}
        onToggle={toggle}
        onRemove={remove}
      />

      <div className={styles.add}>
        <input
          className={styles.input}
          list={listId}
          value={query}
          disabled={disabled}
          placeholder={t("positions.form.addSkillPlaceholder")}
          aria-label={t("positions.form.addSkillPlaceholder")}
          onChange={(event) => {
            setQuery(event.target.value);
            setNotFound(false);
          }}
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
        <select
          className={styles.select}
          value={isRequired ? "required" : "nice"}
          disabled={disabled}
          aria-label={t("positions.form.addAs")}
          onChange={(event) => setIsRequired(event.target.value === "required")}
        >
          <option value="required">{t("positions.form.required")}</option>
          <option value="nice">{t("positions.form.niceToHave")}</option>
        </select>
        <Button
          size="sm"
          variant="ghost"
          disabled={!query.trim() || disabled}
          onClick={add}
        >
          {t("positions.form.addSkill")}
        </Button>
      </div>
      {notFound && (
        <p className={styles.error}>{t("positions.form.skillNotFound")}</p>
      )}
    </div>
  );
}
