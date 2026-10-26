import styles from "./TagList.module.scss";

export function TagList({ items, tone = "neutral" }) {
  if (!items?.length) {
    return null;
  }

  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className={`${styles.tag} ${styles[tone]}`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
