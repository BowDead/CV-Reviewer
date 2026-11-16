import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import styles from "./CvPreview.module.scss";

export function CvPreview({ kind, previewUrl, text, fileName }) {
  const { t } = useTranslation();

  if (kind === "pdf" && previewUrl) {
    return (
      <iframe
        className={styles.pdf}
        src={previewUrl}
        title={t("cvUpload.previewTitle", { fileName })}
      />
    );
  }
  return (
    <div className={styles.text}>
      <Markdown remarkPlugins={[remarkBreaks]}>{text}</Markdown>
    </div>
  );
}
