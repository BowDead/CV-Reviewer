import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useCvFiles } from "../hooks/useCvFiles";
import { CvFileList } from "./CvFileList";
import styles from "./CvFiles.module.scss";

export function CvFilesPanel({ activeFileId, onLoad, onRemoved }) {
  const { t } = useTranslation();
  const { status, cvs, error, actionError, load, remove } = useCvFiles();
  const [loadingId, setLoadingId] = useState(null);

  if (status === "loading") {
    return <EmptyState busy title={t("cvFiles.loading")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("cvFiles.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  async function handleLoad(cv) {
    setLoadingId(cv.id);
    const loaded = await load(cv.id);
    setLoadingId(null);
    if (loaded) {
      onLoad(loaded);
    }
  }

  async function handleRemove(cv) {
    if (!window.confirm(t("cvFiles.confirmRemove", { name: cv.name }))) {
      return;
    }
    if (await remove(cv.id)) {
      onRemoved(cv.id);
    }
  }

  return (
    <div className={styles.panel}>
      <div aria-live="polite">
        {actionError && (
          <p className={styles.error}>{errorMessage(actionError)}</p>
        )}
      </div>
      <CvFileList
        cvs={cvs}
        activeFileId={activeFileId}
        loadingId={loadingId}
        onLoad={handleLoad}
        onRemove={handleRemove}
      />
    </div>
  );
}
