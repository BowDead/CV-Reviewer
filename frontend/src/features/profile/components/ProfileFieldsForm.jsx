import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import styles from "./Profile.module.scss";

export function ProfileFieldsForm({ profile, saving, onSave }) {
  const { t } = useTranslation();
  const [fields, setFields] = useState({
    displayName: profile.displayName ?? "",
    headline: profile.headline ?? "",
    location: profile.location ?? "",
  });

  const changed =
    fields.displayName !== (profile.displayName ?? "") ||
    fields.headline !== (profile.headline ?? "") ||
    fields.location !== (profile.location ?? "");

  function update(name) {
    return (event) =>
      setFields((current) => ({ ...current, [name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(fields);
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2 className={styles.label}>{t("candidateProfile.fieldsTitle")}</h2>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span>{t("candidateProfile.displayName")}</span>
          <input
            id="profile-display-name"
            className={styles.input}
            value={fields.displayName}
            maxLength={100}
            placeholder={t("candidateProfile.displayNamePlaceholder")}
            onChange={update("displayName")}
          />
        </label>
        <label className={styles.field}>
          <span>{t("candidateProfile.headlineLabel")}</span>
          <input
            id="profile-headline"
            className={styles.input}
            value={fields.headline}
            maxLength={150}
            onChange={update("headline")}
          />
        </label>
        <label className={styles.field}>
          <span>{t("candidateProfile.location")}</span>
          <input
            id="profile-location"
            className={styles.input}
            value={fields.location}
            maxLength={100}
            onChange={update("location")}
          />
        </label>
      </div>
      <div className={styles.row}>
        <span className={styles.hint}>{t("candidateProfile.locked")}</span>
        <Button type="submit" size="sm" disabled={!changed || saving}>
          {t("candidateProfile.save")}
        </Button>
      </div>
    </form>
  );
}
