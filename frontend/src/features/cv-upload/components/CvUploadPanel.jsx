import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { CvDropzone } from "./CvDropzone";
import { CvSummary } from "./CvSummary";
import styles from "./CvUploadPanel.module.scss";

export function CvUploadPanel({ cv }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    status,
    name,
    result,
    error,
    upload,
    reset,
    savedCvId,
    saveStatus,
    saveError,
    save,
  } = cv;

  if (status === "done") {
    return (
      <div className={styles.upload}>
        <CvSummary
          fileName={name}
          result={result}
          saved={savedCvId !== null}
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
      <CvDropzone
        onFileSelected={upload}
        onChooseSaved={() => navigate("/files")}
        disabled={status === "uploading"}
      />

      <div aria-live="polite">
        {status === "uploading" && (
          <p className={styles.info}>
            {t("cvUpload.reading", { fileName: name })}
          </p>
        )}
        {status === "error" && (
          <p className={styles.error}>{errorMessage(error)}</p>
        )}
      </div>
    </div>
  );
}
