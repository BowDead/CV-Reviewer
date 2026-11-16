import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CvFilesPanel } from "@/features/cv-files";
import { useWorkspace } from "./useWorkspace";

export function FilesTab() {
  const { t } = useTranslation();
  const { cv } = useWorkspace();
  const navigate = useNavigate();

  function handleLoad(saved) {
    cv.loadSaved(saved);
    navigate("/cv");
  }

  return (
    <>
      <PageHeader title={t("workspace.files.title")} />
      <CvFilesPanel
        activeFileId={cv.savedCvId}
        onLoad={handleLoad}
        onRemoved={cv.forgetSavedCv}
      />
    </>
  );
}
