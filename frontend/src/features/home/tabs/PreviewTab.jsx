import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { CvPreview, CvAnonymizedText } from "@/features/cv-upload";
import { useWorkspace } from "./useWorkspace";
import styles from "./tabs.module.scss";

export function PreviewTab() {
  const { t } = useTranslation();
  const { cv, review, changedAfterAnalysis } = useWorkspace();

  return (
    <>
      <PageHeader
        title={t("workspace.preview.title")}
        description={t("workspace.preview.description")}
      />

      {cv.status === "done" && (
        <div className={styles.split}>
          <CvPreview
            kind={cv.result.kind}
            previewUrl={cv.previewUrl}
            text={cv.result.text}
            fileName={cv.file.name}
          />
          <CvAnonymizedText
            review={review}
            changedAfterAnalysis={changedAfterAnalysis}
          />
        </div>
      )}

      {cv.status === "uploading" && (
        <EmptyState busy title={t("workspace.preview.readingTitle")}>
          {cv.file.name}
        </EmptyState>
      )}

      {(cv.status === "idle" || cv.status === "error") && (
        <EmptyState title={t("workspace.preview.emptyTitle")}>
          {t("workspace.preview.emptyText")}
        </EmptyState>
      )}
    </>
  );
}
