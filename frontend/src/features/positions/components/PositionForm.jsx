import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { createPosition, updatePosition } from "../api/positionsApi";
import { useSkillSuggestion } from "../hooks/useSkillSuggestion";
import { PositionSkillsEditor } from "./PositionSkillsEditor";
import styles from "./Positions.module.scss";

const MAX_DESCRIPTION = 4000;

function mergeSkills(current, suggested) {
  const ids = new Set(current.map((skill) => skill.id));
  return [...current, ...suggested.filter((skill) => !ids.has(skill.id))];
}

export function PositionForm({ position, onSaved, onCancel }) {
  const { t } = useTranslation();
  const suggestion = useSkillSuggestion();
  const [form, setForm] = useState({
    title: position?.title ?? "",
    url: position?.url ?? "",
    description: position?.description ?? "",
  });
  const [skills, setSkills] = useState(position?.skills ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const suggesting = suggestion.status === "loading";
  const busy = saving || suggesting;

  function update(field) {
    return (event) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSuggest() {
    const suggested = await suggestion.suggest(form.title, form.description);
    if (suggested) {
      setSkills((current) => mergeSkills(current, suggested));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      ...form,
      skills: skills.map((skill) => ({
        skillId: skill.id,
        isRequired: skill.isRequired,
      })),
    };
    try {
      const saved = position
        ? await updatePosition(position.id, body)
        : await createPosition(body);
      onSaved(saved);
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.card}>
        <h2 className={styles.label}>{t("positions.form.details")}</h2>
        <label className={styles.field}>
          {t("positions.form.title")}
          <input
            className={styles.input}
            value={form.title}
            maxLength={150}
            required
            disabled={saving}
            onChange={update("title")}
          />
        </label>
        <label className={styles.field}>
          {t("positions.form.url")}
          <input
            className={styles.input}
            type="url"
            value={form.url}
            maxLength={2048}
            placeholder="https://"
            disabled={saving}
            onChange={update("url")}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldHeader}>
            {t("positions.form.description")}
            <span className={styles.counter}>
              {form.description.length}/{MAX_DESCRIPTION}
            </span>
          </span>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            value={form.description}
            maxLength={MAX_DESCRIPTION}
            rows={10}
            required
            disabled={saving}
            placeholder={t("positions.form.descriptionPlaceholder")}
            onChange={update("description")}
          />
        </label>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.label}>{t("positions.form.skills")}</h2>
          <Button
            size="sm"
            variant="ghost"
            disabled={!form.description.trim() || busy}
            onClick={handleSuggest}
          >
            {suggesting
              ? t("positions.form.suggesting")
              : t("positions.form.suggest")}
          </Button>
        </div>
        <p className={styles.hint}>{t("positions.form.suggestHint")}</p>
        {suggestion.status === "error" && (
          <p className={styles.error}>{errorMessage(suggestion.error)}</p>
        )}
        {suggestion.unknownSkills.length > 0 && (
          <p className={styles.hint}>
            {t("positions.form.unknownSkills", {
              names: suggestion.unknownSkills.join(", "),
            })}
          </p>
        )}
        <PositionSkillsEditor
          skills={skills}
          disabled={busy}
          onChange={setSkills}
        />
      </section>

      {error && <p className={styles.error}>{errorMessage(error)}</p>}
      <div className={styles.actions}>
        <Button variant="ghost" disabled={saving} onClick={onCancel}>
          {t("positions.form.cancel")}
        </Button>
        <Button type="submit" disabled={busy}>
          {saving ? t("positions.form.saving") : t("positions.form.save")}
        </Button>
      </div>
    </form>
  );
}
