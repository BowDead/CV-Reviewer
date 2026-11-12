import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { AnalysisHistoryPanel } from "@/features/analysis-history";

export function HistoryTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("workspace.history.title")}
        description={t("workspace.history.description")}
      />
      <AnalysisHistoryPanel />
    </>
  );
}
