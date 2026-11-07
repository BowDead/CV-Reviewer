import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ProfileSummary } from "@/features/cv-analysis";
import { useWorkspace } from "./useWorkspace";
import { AnalysisGate } from "./AnalysisGate";

export function ProfileTab() {
  const { t } = useTranslation();
  const workspace = useWorkspace();

  return (
    <>
      <PageHeader
        title={t("workspace.profile.title")}
        description={t("workspace.profile.description")}
      />
      <AnalysisGate {...workspace}>
        {(result) => <ProfileSummary profile={result.analysis.profile} />}
      </AnalysisGate>
    </>
  );
}
