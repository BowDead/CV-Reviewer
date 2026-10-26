import { TagList } from "@/shared/ui/TagList";
import { ANONYMIZED_LABELS } from "../constants";
import { AnalysisOverview } from "./AnalysisOverview";
import { InsightList } from "./InsightList";
import { RewriteList } from "./RewriteList";
import { ProfileSummary } from "./ProfileSummary";
import styles from "./CvAnalysisResult.module.scss";

export function CvAnalysisResult({ result }) {
  const { analysis, privacy, truncated } = result;

  const removedData = Object.entries(privacy.anonymized).map(
    ([key, count]) => `${ANONYMIZED_LABELS[key] ?? key} (${count})`,
  );

  return (
    <div className={styles.result}>
      {removedData.length > 0 && (
        <p className={styles.note}>
          Przed wysłaniem do AI usunięto: {removedData.join(", ")}.
        </p>
      )}
      {truncated && (
        <p className={styles.warning}>
          CV jest bardzo długie, więc AI przeanalizowało tylko jego początek.
        </p>
      )}

      <AnalysisOverview analysis={analysis} />

      <div className={styles.columns}>
        <InsightList
          title="Mocne strony"
          items={analysis.strengths}
          tone="positive"
        />
        <InsightList
          title="Słabe strony"
          items={analysis.weaknesses}
          tone="negative"
        />
        <InsightList
          title="Plan działania"
          items={analysis.actionItems}
          ordered
        />
        <InsightList
          title="Brakujące sekcje"
          items={analysis.missingSections}
          tone="negative"
        />
      </div>

      <div className={styles.columns}>
        {analysis.suggestedRoles.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Sugerowane stanowiska</h3>
            <TagList items={analysis.suggestedRoles} tone="primary" />
          </div>
        )}
        {analysis.skillsToAdd.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Warto dodać umiejętności</h3>
            <TagList items={analysis.skillsToAdd} tone="success" />
          </div>
        )}
      </div>

      <RewriteList rewrites={analysis.rewrites} />
      <ProfileSummary profile={analysis.profile} />
    </div>
  );
}
