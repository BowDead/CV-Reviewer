import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CvLibraryPanel } from "@/features/cv-files";
import { useWorkspace } from "./useWorkspace";

export function FilesTab() {
  const { t } = useTranslation();
  const { cv, analysis } = useWorkspace();
  const navigate = useNavigate();

  function handleLoadCv(saved) {
    cv.loadSaved(saved);
    navigate("/cv");
  }

  function handleOpenAnalysis(saved, result) {
    if (saved) {
      cv.loadSaved({ ...saved, latestAnalysis: result });
    } else {
      cv.showAnalysis(result);
    }
    navigate("/analysis");
  }

  return (
    <>
      <PageHeader title={t("workspace.files.title")} />
      <CvLibraryPanel
        activeCvId={cv.savedCvId}
        activeAnalysisId={analysis.result?.analysisId ?? null}
        onLoadCv={handleLoadCv}
        onOpenAnalysis={handleOpenAnalysis}
        onCvRemoved={cv.forgetSavedCv}
      />
    </>
  );
}
