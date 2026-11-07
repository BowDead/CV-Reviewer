import { useTranslation } from "react-i18next";
import styles from "./CvPreview.module.scss";

export function CvPreview({ kind, previewUrl, text, fileName }) {
  const { t } = useTranslation();

  if (kind === "pdf") {
    return (
      <iframe
        className={styles.pdf}
        src={previewUrl}
        title={t("cvUpload.previewTitle", { fileName })}
      />
    );
  }
  return <div className={styles.text}>{text}</div>;
}
