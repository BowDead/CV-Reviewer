import styles from "./ItemList.module.scss";

export function ItemList({ children }) {
  return <ul className={styles.list}>{children}</ul>;
}

export function ListItem({ leading, title, badge, meta, actions }) {
  return (
    <li className={styles.item}>
      {leading && <div className={styles.leading}>{leading}</div>}
      <div className={styles.details}>
        <span className={styles.title}>
          {title}
          {badge && <span className={styles.badge}>{badge}</span>}
        </span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </li>
  );
}
