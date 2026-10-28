import { InsightList } from "./InsightList";
import { RewriteList } from "./RewriteList";
import styles from "./CvImprovements.module.scss";

export function CvImprovements({ analysis }) {
  const { actionItems, rewrites } = analysis;

  if (!actionItems.length && !rewrites.length) {
    return (
      <p className={styles.empty}>AI nie zaproponowało poprawek dla tego CV.</p>
    );
  }
  return (
    <div className={styles.improvements}>
      <InsightList title="Plan działania" items={actionItems} ordered />
      <RewriteList rewrites={rewrites} />
    </div>
  );
}
