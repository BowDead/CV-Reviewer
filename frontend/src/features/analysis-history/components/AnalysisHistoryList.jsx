import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ItemList, ListItem } from "@/shared/ui/ItemList";
import styles from "./AnalysisHistory.module.scss";

export function AnalysisHistoryList({ analyses, onOpen, onRemove }) {
  const { t } = useTranslation();

  if (!analyses.length) {
    return (
      <EmptyState title={t("analysisHistory.emptyTitle")}>
        {t("analysisHistory.emptyText")}
      </EmptyState>
    );
  }

  return (
    <ItemList>
      {analyses.map((analysis) => (
        <ListItem
          key={analysis.id}
          leading={
            <span className={styles.score}>
              {analysis.overallScore ?? "–"}
              <span className={styles.scoreMax}>/10</span>
            </span>
          }
          title={analysis.fileName ?? t("analysisHistory.noFileName")}
          badge={
            analysis.isProfileSource ? t("analysisHistory.profileSource") : null
          }
          meta={[
            formatDateTime(analysis.createdAt),
            analysis.seniority,
            analysis.model,
          ]
            .filter(Boolean)
            .join(" · ")}
          actions={
            <>
              <Button size="sm" onClick={() => onOpen(analysis.id)}>
                {t("analysisHistory.open")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={analysis.isProfileSource}
                onClick={() => onRemove(analysis)}
              >
                {t("analysisHistory.remove")}
              </Button>
            </>
          }
        />
      ))}
    </ItemList>
  );
}
