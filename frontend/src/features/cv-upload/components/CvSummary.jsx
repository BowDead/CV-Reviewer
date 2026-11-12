import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import styles from "./CvSummary.module.scss";

const KIND_LABELS = {
  pdf: "PDF",
  docx: "DOCX",
};

export function CvSummary({
  fileName,
  result,
  saved,
  saving,
  onSave,
  onReset,
}) {
  const { t } = useTranslation();
  const { kind, pageCount, stats } = result;

  const meta = [
    KIND_LABELS[kind],
    pageCount !== null && t("cvUpload.pages", { pages: pageCount }),
    t("cvUpload.words", { count: stats.words }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={styles.card}>
      <div className={styles.file}>
        <svg
          className={styles.icon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
        <div className={styles.info}>
          <p className={styles.fileName}>{fileName}</p>
          <p className={styles.meta}>{meta}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="sm" onClick={onReset}>
          {t("cvUpload.changeFile")}
        </Button>
        {saved ? (
          <span className={styles.saved}>{t("cvUpload.saved")}</span>
        ) : (
          <Button variant="ghost" size="sm" onClick={onSave} disabled={saving}>
            {saving ? t("cvUpload.saving") : t("cvUpload.save")}
          </Button>
        )}
      </div>
    </div>
  );
}
