import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CvAnalysisResult } from "@/features/cv-analysis";
import { useWorkspace } from "./useWorkspace";
import { AnalysisGate } from "./AnalysisGate";

export function AnalysisTab() {
  const { t } = useTranslation();
  const workspace = useWorkspace();

  return (
    <>
      <PageHeader
        title={t("workspace.analysis.title")}
        description={t("workspace.analysis.description")}
      />
      <AnalysisGate {...workspace}>
        {(result) => <CvAnalysisResult result={result} />}
      </AnalysisGate>
    </>
  );
}
