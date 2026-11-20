import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSkillDictionary } from "@/features/profile";
import { Button } from "@/shared/ui/Button";
import { SENIORITY_LEVELS } from "../constants";
import styles from "./Candidates.module.scss";

export function CandidateFilters({ positions, initial, onSearch }) {
  const { t } = useTranslation();
  const dictionary = useSkillDictionary();
  const listId = useId();
  const [form, setForm] = useState(initial);
  const [query, setQuery] = useState("");

  const selected = dictionary.filter((skill) =>
    form.skillIds.includes(skill.id),
  );
  const available = dictionary.filter(
    (skill) => !form.skillIds.includes(skill.id),
  );

  function update(field) {
    return (event) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function addSkill() {
    const name = query.trim().toLowerCase();
    const skill = available.find((item) => item.name.toLowerCase() === name);
    if (skill) {
      setForm((current) => ({
        ...current,
        skillIds: [...current.skillIds, skill.id],
      }));
      setQuery("");
    }
  }

  function removeSkill(skillId) {
    setForm((current) => ({
      ...current,
      skillIds: current.skillIds.filter((id) => id !== skillId),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(form);
  }

  return (
    <form className={styles.filters} onSubmit={handleSubmit}>
      <div className={styles.filterGrid}>
        <label className={styles.field}>
          {t("candidates.filters.position")}
          <select
            className={styles.input}
            value={form.positionId}
            onChange={update("positionId")}
          >
            <option value="">{t("candidates.filters.noPosition")}</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.title}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          {t("candidates.filters.seniority")}
          <select
            className={styles.input}
            value={form.seniority}
            onChange={update("seniority")}
          >
            <option value="">{t("candidates.filters.any")}</option>
            {SENIORITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          {t("candidates.filters.location")}
          <input
            className={styles.input}
            value={form.location}
            maxLength={100}
            placeholder={t("candidates.filters.locationPlaceholder")}
            onChange={update("location")}
          />
        </label>
      </div>

      <div className={styles.field}>
        {t("candidates.filters.skills")}
        <div className={styles.skillPicker}>
          {selected.length > 0 && (
            <ul className={styles.tags}>
              {selected.map((skill) => (
                <li key={skill.id} className={styles.tag}>
                  {skill.name}
                  <button
                    type="button"
                    className={styles.tagButton}
                    aria-label={t("candidates.filters.removeSkill", {
                      name: skill.name,
                    })}
                    onClick={() => removeSkill(skill.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            className={`${styles.input} ${styles.skillInput}`}
            list={listId}
            value={query}
            placeholder={t("candidates.filters.skillsPlaceholder")}
            aria-label={t("candidates.filters.skillsPlaceholder")}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSkill();
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
            disabled={!query.trim()}
            onClick={addSkill}
          >
            {t("candidates.filters.addSkill")}
          </Button>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit">{t("candidates.filters.search")}</Button>
      </div>
    </form>
  );
}
