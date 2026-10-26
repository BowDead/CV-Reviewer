import styles from "./RewriteList.module.scss";

export function RewriteList({ rewrites }) {
  if (!rewrites.length) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Propozycje przeredagowania</h3>
      <ol className={styles.list}>
        {rewrites.map((rewrite, index) => (
          <li key={index} className={styles.item}>
            <p className={styles.before}>
              <span className={styles.label}>Przed</span>
              {rewrite.original}
            </p>
            <p className={styles.after}>
              <span className={styles.label}>Po</span>
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
