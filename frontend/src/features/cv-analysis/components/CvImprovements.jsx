import { useTranslation } from "react-i18next";
import { InsightList } from "./InsightList";
import { RewriteList } from "./RewriteList";
import styles from "./CvImprovements.module.scss";

export function CvImprovements({ analysis }) {
  const { t } = useTranslation();
  const { actionItems, rewrites } = analysis;

  if (!actionItems.length && !rewrites.length) {
    return <p className={styles.empty}>{t("cvAnalysis.noImprovements")}</p>;
  }
  return (
    <div className={styles.improvements}>
      <InsightList
        title={t("cvAnalysis.actionItems")}
        items={actionItems}
        ordered
      />
      <RewriteList rewrites={rewrites} />
    </div>
  );
}
