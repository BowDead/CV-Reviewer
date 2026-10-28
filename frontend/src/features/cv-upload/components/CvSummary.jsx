import { Button } from "@/shared/ui/Button";
import styles from "./CvSummary.module.scss";

const KIND_LABELS = {
  pdf: "PDF",
  docx: "DOCX",
};

export function CvSummary({ fileName, result, onReset }) {
  const { kind, pageCount, stats } = result;

  const meta = [
    KIND_LABELS[kind],
    pageCount !== null && `${pageCount} str.`,
    `${stats.words} słów`,
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

      <Button variant="ghost" size="sm" onClick={onReset}>
        Zmień plik
      </Button>
    </div>
  );
}
