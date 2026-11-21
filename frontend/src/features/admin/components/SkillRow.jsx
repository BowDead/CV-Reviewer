import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { updateSkill } from "../api/adminApi";
import { SkillForm } from "./SkillForm";
import styles from "./Admin.module.scss";

const STATUS_TONE = { approved: "ok", pending: "warn", rejected: "muted" };

export function SkillRow({ skill, onChange }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function setStatus(status) {
    setBusy(true);
    setError(null);
    try {
      onChange(await updateSkill(skill.id, { status }));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function save(body) {
    onChange(await updateSkill(skill.id, body));
    setEditing(false);
  }

  if (editing) {
    return (
      <li className={styles.card}>
        <SkillForm
          skill={skill}
          submitLabel={t("admin.skills.save")}
          onSubmit={save}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  const details = [
    skill.category,
    skill.githubLanguage &&
      t("admin.skills.languageValue", { language: skill.githubLanguage }),
    skill.aliases.length > 0 &&
      t("admin.skills.aliasesValue", { aliases: skill.aliases.join(", ") }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className={styles.row}>
      <div className={styles.heading}>
        <span className={styles.title}>{skill.name}</span>
        <span className={styles.meta}>
          {details || t("admin.skills.noCategory")}
        </span>
        {error && <span className={styles.errorText}>{errorMessage(error)}</span>}
      </div>
      <div className={styles.rowActions}>
        <span className={`${styles.badge} ${styles[STATUS_TONE[skill.status]]}`}>
          {t(`admin.skills.status.${skill.status}`)}
        </span>
        {skill.status !== "approved" && (
          <Button size="sm" disabled={busy} onClick={() => setStatus("approved")}>
            {t("admin.skills.approve")}
          </Button>
        )}
        {skill.status !== "rejected" && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => setStatus("rejected")}
          >
            {t("admin.skills.reject")}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => setEditing(true)}
        >
          {t("admin.skills.edit")}
        </Button>
      </div>
    </li>
  );
}
