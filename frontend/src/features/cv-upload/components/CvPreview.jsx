import styles from "./CvPreview.module.scss";

export function CvPreview({ kind, previewUrl, text, fileName }) {
  if (kind === "pdf") {
    return (
      <iframe
        className={styles.pdf}
        src={previewUrl}
        title={`Podgląd CV: ${fileName}`}
      />
    );
  }
  return <div className={styles.text}>{text}</div>;
}
