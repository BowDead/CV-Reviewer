import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";

export function AnalysisGate({ cv, analysis, startAnalysis, children }) {
  const { t } = useTranslation();

  if (cv.status !== "done") {
    return (
      <EmptyState title={t("workspace.gate.noCvTitle")}>
        {t("workspace.gate.noCvText")}
      </EmptyState>
    );
  }

  if (analysis.status === "loading") {
    return (
      <EmptyState busy title={t("workspace.gate.loadingTitle")}>
        {t("workspace.gate.loadingText")}
      </EmptyState>
    );
  }

  if (analysis.status === "error") {
    return (
      <EmptyState
        tone="error"
        title={t("workspace.gate.errorTitle")}
        action={
          <Button onClick={startAnalysis}>{t("cvAnalysis.retry")}</Button>
        }
      >
        {errorMessage(analysis.error)}
      </EmptyState>
    );
  }

  if (analysis.status !== "done") {
    return (
      <EmptyState
        title={t("workspace.gate.idleTitle")}
        action={
          <Button onClick={startAnalysis}>{t("cvAnalysis.analyze")}</Button>
        }
      >
        {t("workspace.gate.idleText")}
      </EmptyState>
    );
  }

  return children(analysis.result);
}
