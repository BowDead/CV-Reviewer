import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { fetchReports } from "../api/adminApi";
import { useAdminList } from "../hooks/useAdminList";
import { ReportCard } from "./ReportCard";
import styles from "./Admin.module.scss";

function ReportList({ resolved }) {
  const { t } = useTranslation();
  const load = useCallback(
    (signal) => fetchReports(resolved, signal).then((data) => data.reports),
    [resolved],
  );
  const { status, items, error, replace } = useAdminList(load);

  if (status === "loading") {
    return <EmptyState busy title={t("admin.reports.loading")} />;
  }
  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("admin.reports.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title={
          resolved ? t("admin.reports.emptyResolved") : t("admin.reports.empty")
        }
      />
    );
  }
  return (
    <ul className={styles.list}>
      {items.map((report) => (
        <ReportCard key={report.id} report={report} onChange={replace} />
      ))}
    </ul>
  );
}

export function ReportsPanel() {
  const { t } = useTranslation();
  const [resolved, setResolved] = useState(false);

  return (
    <div className={styles.panel}>
      <div className={styles.tabs} role="tablist">
        {[false, true].map((value) => (
          <button
            key={String(value)}
            type="button"
            role="tab"
            aria-selected={resolved === value}
            className={
              resolved === value
                ? `${styles.tab} ${styles.tabActive}`
                : styles.tab
            }
            onClick={() => setResolved(value)}
          >
            {value
              ? t("admin.reports.tabResolved")
              : t("admin.reports.tabOpen")}
          </button>
        ))}
      </div>
      <ReportList key={String(resolved)} resolved={resolved} />
    </div>
  );
}
