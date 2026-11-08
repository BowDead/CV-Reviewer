import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import styles from "./LlmKeys.module.scss";

export function LlmKeyForm({ providers, onAdd }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    provider: providers[0]?.id ?? "",
    model: providers[0]?.defaultModel ?? "",
    label: "",
    apiKey: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selected = providers.find((item) => item.id === form.provider);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleProviderChange(event) {
    const provider = providers.find((item) => item.id === event.target.value);
    setForm((current) => ({
      ...current,
      provider: provider.id,
      model: provider.defaultModel,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onAdd(form);
      setForm((current) => ({ ...current, label: "", apiKey: "" }));
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.formTitle}>{t("llmKeys.formTitle")}</h2>

      <label className={styles.field}>
        {t("llmKeys.provider")}
        <select
          name="provider"
          value={form.provider}
          onChange={handleProviderChange}
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        {t("llmKeys.model")}
        <input
          name="model"
          required
          maxLength={100}
          value={form.model}
          onChange={handleChange}
        />
      </label>

      <label className={styles.field}>
        {t("llmKeys.label")}
        <input
          name="label"
          maxLength={100}
          value={form.label}
          onChange={handleChange}
        />
      </label>

      <label className={styles.field}>
        {t("llmKeys.apiKey")}
        <input
          type="password"
          name="apiKey"
          autoComplete="off"
          required
          maxLength={500}
          value={form.apiKey}
          onChange={handleChange}
        />
        {selected?.keysUrl && (
          <span className={styles.hint}>
            <Trans
              i18nKey="llmKeys.keysHint"
              components={[
                <a
                  key="keysUrl"
                  href={selected.keysUrl}
                  target="_blank"
                  rel="noreferrer"
                />,
              ]}
            />
          </span>
        )}
      </label>

      <div aria-live="polite">
        {error && <p className={styles.error}>{errorMessage(error)}</p>}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? t("llmKeys.submitting") : t("llmKeys.submit")}
      </Button>
    </form>
  );
}
