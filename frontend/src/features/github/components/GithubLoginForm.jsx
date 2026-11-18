import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import styles from "./Github.module.scss";

export function GithubLoginForm({ initialLogin = "", onSave, onCancel }) {
  const { t } = useTranslation();
  const [login, setLogin] = useState(initialLogin);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(login);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>{t("github.formTitle")}</h2>
      <p className={styles.hint}>{t("github.formHint")}</p>

      <label className={styles.field}>
        {t("github.login")}
        <input
          name="login"
          required
          maxLength={100}
          autoComplete="off"
          placeholder="octocat"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
        />
      </label>

      <div aria-live="polite">
        {error && <p className={styles.error}>{errorMessage(error)}</p>}
      </div>

      <div className={styles.buttons}>
        <Button type="submit" disabled={saving}>
          {saving ? t("github.saving") : t("github.save")}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {t("github.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
