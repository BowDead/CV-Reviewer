import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAnalysisHistory } from "@/features/analysis-history";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ItemList, ListItem } from "@/shared/ui/ItemList";
import { useCvFiles } from "../hooks/useCvFiles";
import { AnalysisRows } from "./AnalysisRows";
import styles from "./CvFiles.module.scss";

function FileIcon() {
  return (
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
  );
}

function groupByCv(analyses) {
  const groups = new Map();
  for (const analysis of analyses) {
    const key = analysis.cvId ?? null;
    groups.set(key, [...(groups.get(key) ?? []), analysis]);
  }
  return groups;
}

export function CvLibraryPanel({
  activeCvId,
  activeAnalysisId,
  onLoadCv,
  onOpenAnalysis,
  onCvRemoved,
}) {
  const { t } = useTranslation();
  const files = useCvFiles();
  const history = useAnalysisHistory();
  const [loadingId, setLoadingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);

  if (files.status === "loading" || history.status === "loading") {
    return <EmptyState busy title={t("cvFiles.loading")} />;
  }

  if (files.status === "error" || history.status === "error") {
    return (
      <EmptyState tone="error" title={t("cvFiles.loadFailed")}>
        {errorMessage(files.error ?? history.error)}
      </EmptyState>
    );
  }

  if (files.cvs.length === 0 && history.analyses.length === 0) {
    return (
      <EmptyState title={t("cvFiles.emptyTitle")}>
        {t("cvFiles.emptyText")}
      </EmptyState>
    );
  }

  const byCv = groupByCv(history.analyses);
  const withoutCv = byCv.get(null) ?? [];
  const actionError = files.actionError ?? history.actionError;

  async function handleLoad(cv) {
    setLoadingId(cv.id);
    const saved = await files.load(cv.id);
    setLoadingId(null);
    if (saved) {
      onLoadCv(saved);
    }
  }

  async function handleRemoveCv(cv) {
    if (!window.confirm(t("cvFiles.confirmRemove", { name: cv.name }))) {
      return;
    }
    if (await files.remove(cv.id)) {
      history.detachCv(cv.id);
      onCvRemoved(cv.id);
    }
  }

  async function handleOpen(analysis) {
    setOpeningId(analysis.id);
    const detail = await history.open(analysis.id);
    const saved =
      detail && analysis.cvId ? await files.load(analysis.cvId) : null;
    setOpeningId(null);
    if (detail) {
      onOpenAnalysis(saved, detail.result);
    }
  }

  function handleRemoveAnalysis(analysis) {
    const date = formatDateTime(analysis.createdAt);
    if (window.confirm(t("cvFiles.confirmRemoveAnalysis", { date }))) {
      history.remove(analysis.id);
    }
  }

  const rowProps = {
    activeAnalysisId,
    openingId,
    onOpen: handleOpen,
    onRemove: handleRemoveAnalysis,
  };

  return (
    <div className={styles.panel}>
      {actionError && (
        <p className={styles.error} role="alert">
          {errorMessage(actionError)}
        </p>
      )}

      {files.cvs.map((cv) => {
        const analyses = byCv.get(cv.id) ?? [];
        return (
          <section key={cv.id} className={styles.group}>
            <ItemList>
              <ListItem
                leading={<FileIcon />}
                title={cv.name}
                badge={cv.id === activeCvId ? t("cvFiles.active") : null}
                meta={t("cvFiles.savedAt", {
                  date: formatDateTime(cv.createdAt),
                })}
                actions={
                  <>
                    <Button
                      size="sm"
                      disabled={loadingId !== null}
                      onClick={() => handleLoad(cv)}
                    >
                      {loadingId === cv.id
                        ? t("cvFiles.loadingFile")
                        : t("cvFiles.load")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCv(cv)}
                    >
                      {t("cvFiles.remove")}
                    </Button>
                  </>
                }
              />
            </ItemList>
            <div className={styles.analyses}>
              {analyses.length > 0 ? (
                <AnalysisRows analyses={analyses} {...rowProps} />
              ) : (
                <p className={styles.noAnalyses}>{t("cvFiles.noAnalyses")}</p>
              )}
            </div>
          </section>
        );
      })}

      {withoutCv.length > 0 && (
        <section className={styles.group}>
          <h2 className={styles.groupTitle}>{t("cvFiles.withoutCvTitle")}</h2>
          <AnalysisRows analyses={withoutCv} {...rowProps} />
        </section>
      )}
    </div>
  );
}
