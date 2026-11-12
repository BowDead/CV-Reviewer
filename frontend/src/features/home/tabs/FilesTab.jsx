import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CvFilesPanel } from "@/features/cv-files";
import { useWorkspace } from "./useWorkspace";

export function FilesTab() {
  const { t } = useTranslation();
  const { cv } = useWorkspace();
  const navigate = useNavigate();

  function handleLoad(file, savedFileId) {
    cv.upload(file, savedFileId);
    navigate("/cv");
  }

  return (
    <>
      <PageHeader
        title={t("workspace.files.title")}
        description={t("workspace.files.description")}
      />
      <CvFilesPanel
        activeFileId={cv.savedFileId}
        onLoad={handleLoad}
        onRemoved={cv.forgetSavedFile}
      />
    </>
  );
}
