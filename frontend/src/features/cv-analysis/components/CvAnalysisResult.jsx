import { useTranslation } from "react-i18next";
import { TagList } from "@/shared/ui/TagList";
import { AnalysisOverview } from "./AnalysisOverview";
import { InsightList } from "./InsightList";
import styles from "./CvAnalysisResult.module.scss";

export function CvAnalysisResult({ result }) {
  const { t } = useTranslation();
  const { analysis, truncated } = result;

  return (
    <div className={styles.result}>
      {truncated && (
        <p className={styles.warning}>{t("cvAnalysis.truncated")}</p>
      )}

      <AnalysisOverview analysis={analysis} />

      <div className={styles.columns}>
        <InsightList
          title={t("cvAnalysis.strengths")}
          items={analysis.strengths}
          tone="positive"
        />
        <InsightList
          title={t("cvAnalysis.weaknesses")}
          items={analysis.weaknesses}
          tone="negative"
        />
        <InsightList
          title={t("cvAnalysis.missingSections")}
          items={analysis.missingSections}
          tone="negative"
        />

        {(analysis.suggestedRoles.length > 0 ||
          analysis.skillsToAdd.length > 0) && (
          <div className={styles.card}>
            {analysis.suggestedRoles.length > 0 && (
              <div>
                <h3 className={styles.cardTitle}>
                  {t("cvAnalysis.suggestedRoles")}
                </h3>
                <TagList items={analysis.suggestedRoles} tone="primary" />
              </div>
            )}
            {analysis.skillsToAdd.length > 0 && (
              <div>
                <h3 className={styles.cardTitle}>
                  {t("cvAnalysis.skillsToAdd")}
                </h3>
                <TagList items={analysis.skillsToAdd} tone="success" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
