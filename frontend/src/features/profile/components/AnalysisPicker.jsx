import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { formatScore } from "./formatScore";
import styles from "./Profile.module.scss";

export function AnalysisPicker({
  choices,
  sourceId,
  hasProfile,
  saving,
  onConfirm,
  onClose,
}) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleConfirm() {
    if (await onConfirm(selected)) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="analysis-picker-title"
      onClose={onClose}
    >
      <h2 id="analysis-picker-title" className={styles.dialogTitle}>
        {t("candidateProfile.pickerTitle")}
      </h2>

      {choices.status === "loading" && (
        <p className={styles.hint}>{t("candidateProfile.pickerLoading")}</p>
      )}
      {choices.status === "error" && (
        <p className={styles.error}>{errorMessage(choices.error)}</p>
      )}
      {choices.status === "done" && choices.analyses.length === 0 && (
        <p className={styles.hint}>{t("candidateProfile.pickerEmpty")}</p>
      )}

      {choices.analyses.length > 0 && (
        <ul className={styles.choices}>
          {choices.analyses.map((analysis) => (
            <li key={analysis.id}>
              <label
                className={`${styles.choice} ${
                  selected === analysis.id ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name="profile-analysis"
                  className={styles.radio}
                  checked={selected === analysis.id}
                  onChange={() => setSelected(analysis.id)}
                />
                <span className={styles.choiceText}>
                  <span
                    className={
                      analysis.cvName ? styles.choiceName : styles.choiceMuted
                    }
                  >
                    {analysis.cvName ?? t("candidateProfile.unsavedCv")}
                    {analysis.id === sourceId && (
                      <span className={styles.sourceBadge}>
                        {t("candidateProfile.currentSource")}
                      </span>
                    )}
                  </span>
                  <span className={styles.meta}>
                    {formatDateTime(analysis.createdAt)}
                  </span>
                </span>
                <span className={styles.choiceScore}>
                  {formatScore(analysis.overallScore)}
                  <span className={styles.scoreLabel}>
                    {analysis.seniority ?? "–"}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {hasProfile && (
        <p className={styles.hint}>{t("candidateProfile.pickerWarning")}</p>
      )}

      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onClose}>
          {t("candidateProfile.cancel")}
        </Button>
        <Button
          size="sm"
          disabled={!selected || selected === sourceId || saving}
          onClick={handleConfirm}
        >
          {t("candidateProfile.useAnalysis")}
        </Button>
      </div>
    </dialog>
  );
}
