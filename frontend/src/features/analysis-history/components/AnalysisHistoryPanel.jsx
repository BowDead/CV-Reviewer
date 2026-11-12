import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useAnalysisHistory } from "../hooks/useAnalysisHistory";
import { AnalysisHistoryList } from "./AnalysisHistoryList";
import styles from "./AnalysisHistory.module.scss";

export function AnalysisHistoryPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { status, analyses, error, actionError, remove } = useAnalysisHistory();

  if (status === "loading") {
    return <EmptyState busy title={t("analysisHistory.loading")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("analysisHistory.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  function handleRemove(analysis) {
    const date = formatDateTime(analysis.createdAt);
    if (window.confirm(t("analysisHistory.confirmRemove", { date }))) {
      remove(analysis.id);
    }
  }

  return (
    <div className={styles.panel}>
      <div aria-live="polite">
        {actionError && (
          <p className={styles.error}>{errorMessage(actionError)}</p>
        )}
      </div>
      <AnalysisHistoryList
        analyses={analyses}
        onOpen={(id) => navigate(`/history/${id}`)}
        onRemove={handleRemove}
      />
    </div>
  );
}
