import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useCvFiles } from "../hooks/useCvFiles";
import { CvFileList } from "./CvFileList";
import styles from "./CvFiles.module.scss";

export function CvFilesPanel({ activeFileId, onLoad, onRemoved }) {
  const { t } = useTranslation();
  const { status, files, error, actionError, load, remove } = useCvFiles();
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

  async function handleLoad(file) {
    setLoadingId(file.id);
    const loaded = await load(file);
    setLoadingId(null);
    if (loaded) {
      onLoad(loaded, file.id);
    }
  }

  async function handleRemove(file) {
    if (
      !window.confirm(t("cvFiles.confirmRemove", { fileName: file.fileName }))
    ) {
      return;
    }
    if (await remove(file.id)) {
      onRemoved(file.id);
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
        files={files}
        activeFileId={activeFileId}
        loadingId={loadingId}
        onLoad={handleLoad}
        onRemove={handleRemove}
      />
    </div>
  );
}
