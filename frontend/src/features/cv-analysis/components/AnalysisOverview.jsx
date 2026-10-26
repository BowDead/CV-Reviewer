import styles from "./AnalysisOverview.module.scss";

function formatScore(score) {
  return score ?? "–";
}

export function AnalysisOverview({ analysis }) {
  const { overallScore, seniority, summary, categories } = analysis;

  return (
    <div className={styles.overview}>
      <div className={styles.score}>
        <span className={styles.scoreValue}>{formatScore(overallScore)}</span>
        <span className={styles.scoreMax}>/ 10</span>
        {seniority && <span className={styles.seniority}>{seniority}</span>}
      </div>

      <div className={styles.details}>
        {summary && <p className={styles.summary}>{summary}</p>}

        {categories.length > 0 && (
          <ul className={styles.categories}>
            {categories.map((category) => (
              <li key={category.name} className={styles.category}>
                <div className={styles.categoryHeader}>
                  <span>{category.name}</span>
                  <span className={styles.categoryScore}>
                    {formatScore(category.score)}/10
                  </span>
                </div>
                <div className={styles.bar}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(category.score ?? 0) * 10}%` }}
                  />
                </div>
                {category.comment && (
                  <p className={styles.categoryComment}>{category.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
