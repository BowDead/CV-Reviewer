import { CvDropzone } from "./CvDropzone";
import { CvPreview } from "./CvPreview";
import { CvSummary } from "./CvSummary";
import styles from "./CvUploadPanel.module.scss";

export function CvUploadPanel({ cv }) {
  const { status, file, previewUrl, result, error, upload, reset } = cv;
  if (status === "done") {
    return (
      <div className={styles.layout}>
        <CvPreview
          kind={result.kind}
          previewUrl={previewUrl}
          text={result.text}
          fileName={file.name}
        />
        <CvSummary fileName={file.name} result={result} onReset={reset} />
      </div>
    );
  }
  return (
    <div className={styles.upload}>
      <CvDropzone onFileSelected={upload} disabled={status === "uploading"} />

      <div aria-live="polite">
        {status === "uploading" && (
          <p className={styles.info}>Odczytywanie pliku „{file.name}”…</p>
        )}
        {status === "error" && <p className={styles.error}>{error.message}</p>}
      </div>
    </div>
  );
}
