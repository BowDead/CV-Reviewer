import { NavLink } from "react-router";
import styles from "./SidebarNav.module.scss";

function linkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

export function SidebarNav({ title, items }) {
  return (
    <nav className={styles.group} aria-label={title}>
      <h2 className={styles.label}>{title}</h2>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={linkClassName}>
          <span>{item.label}</span>
          {item.badge ? (
            <span className={styles.badge}>{item.badge}</span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
