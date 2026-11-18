import styles from "./InsightList.module.scss";

export function InsightList({
  title,
  items,
  tone = "neutral",
  ordered = false,
  children,
}) {
  if (!children && !items.length) {
    return null;
  }

  const ListTag = ordered ? "ol" : "ul";

  return (
    <div className={`${styles.card} ${styles[tone]}`}>
      <h3 className={styles.title}>{title}</h3>
      {children ?? (
        <ListTag className={styles.list}>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ListTag>
      )}
    </div>
  );
}
