import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { ItemList, ListItem } from "@/shared/ui/ItemList";
import styles from "./CvFiles.module.scss";

function badgeFor(analysis, activeAnalysisId, t) {
  if (analysis.isProfileSource) {
    return t("analysisHistory.profileSource");
  }
  if (analysis.id === activeAnalysisId) {
    return t("cvFiles.shown");
  }
  return null;
}

export function AnalysisRows({
  analyses,
  activeAnalysisId,
  openingId,
  onOpen,
  onRemove,
}) {
  const { t } = useTranslation();

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
          title={formatDateTime(analysis.createdAt)}
          badge={badgeFor(analysis, activeAnalysisId, t)}
          meta={[analysis.seniority, analysis.model]
            .filter(Boolean)
            .join(" · ")}
          actions={
            <>
              <Button
                size="sm"
                disabled={openingId !== null}
                onClick={() => onOpen(analysis)}
              >
                {openingId === analysis.id
                  ? t("cvFiles.opening")
                  : t("cvFiles.openAnalysis")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={analysis.isProfileSource}
                onClick={() => onRemove(analysis)}
              >
                {t("cvFiles.remove")}
              </Button>
            </>
          }
        />
      ))}
    </ItemList>
  );
}
