import { useTranslation } from "react-i18next";
import styles from "./CriteriaList.module.scss";

const LEVELS = {
  2: "met",
  1: "partial",
  0: "notMet",
};

export function CriteriaList({ criteria }) {
  const { t } = useTranslation();

  return (
    <ul className={styles.list}>
      {criteria.map((criterion) => {
        const level = LEVELS[criterion.level] ?? "notRated";
        const isSystem = criterion.source === "system";
        return (
          <li key={criterion.id} className={styles.item}>
            <span className={`${styles.status} ${styles[level]}`}>
              {t(`cvAnalysis.criteria.${level}`)}
            </span>
            <div className={styles.body}>
              <p className={styles.label}>{criterion.label}</p>
              {criterion.comment && (
                <p className={styles.comment}>{criterion.comment}</p>
              )}
              {criterion.evidence &&
                (isSystem ? (
                  <p className={styles.comment}>{criterion.evidence}</p>
                ) : (
                  <q className={styles.evidence}>{criterion.evidence}</q>
                ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
