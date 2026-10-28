import styles from "./PageHeader.module.scss";

export function PageHeader({ title, description }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
