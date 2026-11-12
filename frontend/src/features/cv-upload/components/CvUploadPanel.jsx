import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { CvDropzone } from "./CvDropzone";
import { CvSummary } from "./CvSummary";
import styles from "./CvUploadPanel.module.scss";

export function CvUploadPanel({ cv }) {
  const { t } = useTranslation();
  const {
    status,
    file,
    result,
    error,
    upload,
    reset,
    savedFileId,
    saveStatus,
    saveError,
    save,
  } = cv;

  if (status === "done") {
    return (
      <div className={styles.upload}>
        <CvSummary
          fileName={file.name}
          result={result}
          saved={savedFileId !== null}
          saving={saveStatus === "saving"}
          onSave={save}
          onReset={reset}
        />
        <div aria-live="polite">
          {saveStatus === "error" && (
            <p className={styles.error}>{errorMessage(saveError)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.upload}>
      <CvDropzone onFileSelected={upload} disabled={status === "uploading"} />
      <Link to="/files" className={styles.savedLink}>
        {t("cvUpload.fromSaved")}
      </Link>

      <div aria-live="polite">
        {status === "uploading" && (
          <p className={styles.info}>
            {t("cvUpload.reading", { fileName: file.name })}
          </p>
        )}
        {status === "error" && (
          <p className={styles.error}>{errorMessage(error)}</p>
        )}
      </div>
    </div>
  );
}
