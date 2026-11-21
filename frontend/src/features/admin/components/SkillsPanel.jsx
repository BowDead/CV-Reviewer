import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { createSkill, fetchDictionary } from "../api/adminApi";
import { useAdminList } from "../hooks/useAdminList";
import { SkillForm } from "./SkillForm";
import { SkillRow } from "./SkillRow";
import styles from "./Admin.module.scss";

const STATUSES = ["pending", "approved", "rejected"];

function SkillList({ query }) {
  const { t } = useTranslation();
  const load = useCallback(
    (signal) => fetchDictionary(query, signal).then((data) => data.skills),
    [query],
  );
  const { status, items, error, replace, prepend } = useAdminList(load);
  const [adding, setAdding] = useState(false);

  async function add(body) {
    prepend(await createSkill(body));
    setAdding(false);
  }

  if (status === "loading") {
    return <EmptyState busy title={t("admin.skills.loading")} />;
  }
  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("admin.skills.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  return (
    <>
      {adding ? (
        <section className={styles.card}>
          <h2 className={styles.label}>{t("admin.skills.addTitle")}</h2>
          <SkillForm
            submitLabel={t("admin.skills.add")}
            onSubmit={add}
            onCancel={() => setAdding(false)}
          />
        </section>
      ) : (
        <div>
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            {t("admin.skills.addTitle")}
          </Button>
        </div>
      )}
      {items.length === 0 ? (
        <EmptyState title={t("admin.skills.empty")} />
      ) : (
        <ul className={styles.list}>
          {items.map((skill) => (
            <SkillRow key={skill.id} skill={skill} onChange={replace} />
          ))}
        </ul>
      )}
    </>
  );
}

export function SkillsPanel() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ status: "pending", q: "" });
  const [query, setQuery] = useState("status=pending");

  function submit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (form.status) params.set("status", form.status);
    if (form.q.trim()) params.set("q", form.q.trim());
    setQuery(params.toString());
  }

  return (
    <div className={styles.panel}>
      <p className={styles.hint}>{t("admin.skills.hint")}</p>
      <form className={styles.filters} onSubmit={submit}>
        <label className={styles.field}>
          {t("admin.skills.statusFilter")}
          <select
            className={styles.input}
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="">{t("admin.any")}</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`admin.skills.status.${status}`)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          {t("admin.skills.search")}
          <input
            className={styles.input}
            value={form.q}
            onChange={(event) =>
              setForm((current) => ({ ...current, q: event.target.value }))
            }
          />
        </label>
        <div className={styles.filterSubmit}>
          <Button type="submit">{t("admin.search")}</Button>
        </div>
      </form>
      <SkillList key={query} query={query} />
    </div>
  );
}
