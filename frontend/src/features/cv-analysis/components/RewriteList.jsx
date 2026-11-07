import { useTranslation } from "react-i18next";
import styles from "./RewriteList.module.scss";

export function RewriteList({ rewrites }) {
  const { t } = useTranslation();

  if (!rewrites.length) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{t("cvAnalysis.rewritesTitle")}</h3>
      <ol className={styles.list}>
        {rewrites.map((rewrite, index) => (
          <li key={index} className={styles.item}>
            <p className={styles.before}>
              <span className={styles.label}>{t("cvAnalysis.before")}</span>
              {rewrite.original}
            </p>
            <p className={styles.after}>
              <span className={styles.label}>{t("cvAnalysis.after")}</span>
              {rewrite.improved}
            </p>
            {rewrite.reason && (
              <p className={styles.reason}>{rewrite.reason}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
