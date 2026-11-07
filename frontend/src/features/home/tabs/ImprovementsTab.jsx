import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CvImprovements } from "@/features/cv-analysis";
import { useWorkspace } from "./useWorkspace";
import { AnalysisGate } from "./AnalysisGate";

export function ImprovementsTab() {
  const { t } = useTranslation();
  const workspace = useWorkspace();

  return (
    <>
      <PageHeader
        title={t("workspace.improvements.title")}
        description={t("workspace.improvements.description")}
      />
      <AnalysisGate {...workspace}>
        {(result) => <CvImprovements analysis={result.analysis} />}
      </AnalysisGate>
    </>
  );
}
