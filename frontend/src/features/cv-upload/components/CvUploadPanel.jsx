import { CvDropzone } from "./CvDropzone";
import { CvSummary } from "./CvSummary";
import styles from "./CvUploadPanel.module.scss";

export function CvUploadPanel({ cv }) {
  const { status, file, result, error, upload, reset } = cv;

  if (status === "done") {
    return <CvSummary fileName={file.name} result={result} onReset={reset} />;
  }

  return (
    <div className={styles.upload}>
      <CvDropzone onFileSelected={upload} disabled={status === "uploading"} />

      <div aria-live="polite">
        {status === "uploading" && (
          <p className={styles.info}>Odczytywanie „{file.name}”…</p>
        )}
        {status === "error" && <p className={styles.error}>{error.message}</p>}
      </div>
    </div>
  );
}
