import styles from "./AppLayout.module.scss";

export function AppLayout({ sidebar, footer, children }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            CV
          </span>
          CV Reviewer
        </div>

        {sidebar}

        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
