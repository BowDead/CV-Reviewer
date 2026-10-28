import styles from "./EmptyState.module.scss";

export function EmptyState({
  title,
  children,
  action,
  tone = "neutral",
  busy = false,
}) {
  return (
    <div
      className={`${styles.empty} ${styles[tone]}`}
      role={tone === "error" ? "alert" : "status"}
      aria-busy={busy || undefined}
    >
      {busy && <span className={styles.progress} aria-hidden="true" />}
      <h2 className={styles.title}>{title}</h2>
      {children && <p className={styles.text}>{children}</p>}
      {action}
    </div>
  );
}
