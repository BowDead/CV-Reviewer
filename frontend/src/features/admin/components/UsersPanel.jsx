import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { fetchUsers, setUserBlocked } from "../api/adminApi";
import { useAdminList } from "../hooks/useAdminList";
import styles from "./Admin.module.scss";

const EMPTY_FILTERS = { email: "", role: "", blocked: "" };

function toQuery(filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) params.set(key, value.trim());
  }
  return params.toString();
}

function UserRow({ user, isSelf, onChange }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      onChange(await setUserBlocked(user.id, !user.isBlocked));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={styles.row}>
      <div className={styles.heading}>
        <span className={styles.title}>{user.email}</span>
        <span className={styles.meta}>
          {t(`roles.${user.role}`)} ·{" "}
          {t("admin.users.created", { date: formatDateTime(user.createdAt) })}
        </span>
        {error && (
          <span className={styles.errorText}>{errorMessage(error)}</span>
        )}
      </div>
      <div className={styles.rowActions}>
        {user.isBlocked && (
          <span className={`${styles.badge} ${styles.danger}`}>
            {t("admin.users.blocked")}
          </span>
        )}
        {!isSelf && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={toggle}>
            {user.isBlocked ? t("admin.users.unblock") : t("admin.users.block")}
          </Button>
        )}
      </div>
    </li>
  );
}

function UserList({ query }) {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const load = useCallback(
    (signal) => fetchUsers(query, signal).then((data) => data.users),
    [query],
  );
  const { status, items, error, replace } = useAdminList(load);

  if (status === "loading") {
    return <EmptyState busy title={t("admin.users.loading")} />;
  }
  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("admin.users.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }
  if (items.length === 0) {
    return <EmptyState title={t("admin.users.empty")} />;
  }
  return (
    <ul className={styles.list}>
      {items.map((user) => (
        <UserRow
          key={user.id}
          user={user}
          isSelf={user.id === me?.id}
          onChange={replace}
        />
      ))}
    </ul>
  );
}

export function UsersPanel() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FILTERS);
  const [query, setQuery] = useState("");

  function update(field) {
    return (event) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  return (
    <div className={styles.panel}>
      <form
        className={styles.filters}
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(toQuery(form));
        }}
      >
        <label className={styles.field}>
          {t("admin.users.email")}
          <input
            className={styles.input}
            value={form.email}
            onChange={update("email")}
          />
        </label>
        <label className={styles.field}>
          {t("admin.users.role")}
          <select
            className={styles.input}
            value={form.role}
            onChange={update("role")}
          >
            <option value="">{t("admin.any")}</option>
            {["candidate", "employer", "admin"].map((role) => (
              <option key={role} value={role}>
                {t(`roles.${role}`)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          {t("admin.users.state")}
          <select
            className={styles.input}
            value={form.blocked}
            onChange={update("blocked")}
          >
            <option value="">{t("admin.any")}</option>
            <option value="false">{t("admin.users.active")}</option>
            <option value="true">{t("admin.users.blocked")}</option>
          </select>
        </label>
        <div className={styles.filterSubmit}>
          <Button type="submit">{t("admin.search")}</Button>
        </div>
      </form>
      <UserList key={query} query={query} />
    </div>
  );
}
