import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { OffersPanel } from "@/features/offers";
import { useWorkspace } from "./useWorkspace";

export function OffersTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { analysis } = useWorkspace();
  const analysisId =
    analysis.status === "done" ? analysis.result?.analysisId : null;

  return (
    <>
      <PageHeader title={t("workspace.offers.title")} />
      {analysisId ? (
        <OffersPanel analysisId={analysisId} />
      ) : (
        <EmptyState
          title={t("offers.noAnalysisTitle")}
          action={
            <Button onClick={() => navigate("/files")}>
              {t("offers.goToFiles")}
            </Button>
          }
        >
          {t("offers.noAnalysisText")}
        </EmptyState>
      )}
    </>
  );
}
