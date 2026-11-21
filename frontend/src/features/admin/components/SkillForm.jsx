import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import styles from "./Admin.module.scss";

function toForm(skill) {
  return {
    name: skill?.name ?? "",
    category: skill?.category ?? "",
    githubLanguage: skill?.githubLanguage ?? "",
    aliases: (skill?.aliases ?? []).join(", "),
    caseSensitive: skill?.caseSensitive ?? false,
  };
}

function toBody(form) {
  return {
    name: form.name,
    category: form.category,
    githubLanguage: form.githubLanguage,
    aliases: form.aliases
      .split(",")
      .map((alias) => alias.trim())
      .filter(Boolean),
    caseSensitive: form.caseSensitive,
  };
}

export function SkillForm({ skill, submitLabel, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => toForm(skill));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field) {
    return (event) =>
      setForm((current) => ({
        ...current,
        [field]:
          event.target.type === "checkbox"
            ? event.target.checked
            : event.target.value,
      }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(toBody(form));
      setForm(toForm(skill));
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.skillForm} onSubmit={handleSubmit}>
      <div className={styles.filters}>
        <label className={styles.field}>
          {t("admin.skills.name")}
          <input
            className={styles.input}
            value={form.name}
            maxLength={100}
            required
            onChange={update("name")}
          />
        </label>
        <label className={styles.field}>
          {t("admin.skills.category")}
          <input
            className={styles.input}
            value={form.category}
            maxLength={50}
            onChange={update("category")}
          />
        </label>
        <label className={styles.field}>
          {t("admin.skills.githubLanguage")}
          <input
            className={styles.input}
            value={form.githubLanguage}
            maxLength={50}
            onChange={update("githubLanguage")}
          />
        </label>
        <label className={styles.field}>
          {t("admin.skills.aliases")}
          <input
            className={styles.input}
            value={form.aliases}
            placeholder={t("admin.skills.aliasesPlaceholder")}
            onChange={update("aliases")}
          />
        </label>
      </div>
      <label className={styles.check}>
        <input
          type="checkbox"
          checked={form.caseSensitive}
          onChange={update("caseSensitive")}
        />
        {t("admin.skills.caseSensitive")}
      </label>
      {error && <p className={styles.error}>{errorMessage(error)}</p>}
      <div className={styles.actions}>
        {onCancel && (
          <Button
            size="sm"
            variant="ghost"
            disabled={saving}
            onClick={onCancel}
          >
            {t("admin.skills.cancel")}
          </Button>
        )}
        <Button type="submit" size="sm" disabled={!form.name.trim() || saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
