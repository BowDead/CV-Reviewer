import { useId, useState } from "react";
import { NavLink, useLocation } from "react-router";
import styles from "./SidebarNav.module.scss";

function linkClassName({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link;
}

function NavItem({ item }) {
  return (
    <NavLink to={item.to} className={linkClassName}>
      <span>{item.label}</span>
      {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
    </NavLink>
  );
}

function NavGroup({ group, open, active, onToggle }) {
  const listId = useId();
  const badge = group.items.reduce((sum, item) => sum + (item.badge ?? 0), 0);

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={
          active ? `${styles.header} ${styles.headerActive}` : styles.header
        }
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
      >
        <span className={styles.chevron} aria-hidden="true" />
        <span className={styles.title}>{group.title}</span>
        {!open && badge > 0 ? (
          <span className={styles.badge}>{badge}</span>
        ) : null}
      </button>
      <div id={listId} className={styles.list} hidden={!open}>
        {group.items.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </div>
    </div>
  );
}

function findActiveGroup(entries, pathname) {
  const active = entries.find(
    (entry) =>
      entry.items?.length > 1 &&
      entry.items.some((item) => pathname.startsWith(item.to)),
  );
  return active?.id ?? null;
}

export function SidebarNav({ label, entries }) {
  const { pathname } = useLocation();
  const activeGroup = findActiveGroup(entries, pathname);
  const [closedGroups, setClosedGroups] = useState(() => new Set());
  const [shownFor, setShownFor] = useState(activeGroup);

  if (activeGroup !== shownFor) {
    setShownFor(activeGroup);
    if (activeGroup && closedGroups.has(activeGroup)) {
      const next = new Set(closedGroups);
      next.delete(activeGroup);
      setClosedGroups(next);
    }
  }

  function toggleGroup(id) {
    setClosedGroups((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <nav className={styles.nav} aria-label={label}>
      {entries.map((entry) =>
        entry.items?.length > 1 ? (
          <NavGroup
            key={entry.id}
            group={entry}
            open={!closedGroups.has(entry.id)}
            active={activeGroup === entry.id}
            onToggle={() => toggleGroup(entry.id)}
          />
        ) : (
          <NavItem key={entry.id} item={entry.items?.[0] ?? entry} />
        ),
      )}
    </nav>
  );
}
