import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import {
  resolveReport,
  setPositionBlocked,
  setUserBlocked,
} from "../api/adminApi";
import styles from "./Admin.module.scss";

export function ReportCard({ report, onChange }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const { invitation } = report;
  const { position, employer } = invitation;

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      onChange(await action());
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  function togglePosition() {
    run(async () => {
      const updated = await setPositionBlocked(
        position.id,
        !position.isBlocked,
      );
      return {
        ...report,
        invitation: {
          ...invitation,
          position: { ...position, isBlocked: updated.isBlocked },
        },
      };
    });
  }

  function toggleEmployer() {
    run(async () => {
      const updated = await setUserBlocked(employer.id, !employer.isBlocked);
      return {
        ...report,
        invitation: {
          ...invitation,
          employer: { ...employer, isBlocked: updated.isBlocked },
        },
      };
    });
  }

  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.heading}>
          <span className={styles.title}>
            {t("admin.reports.position", { title: position.title })}
          </span>
          <span className={styles.meta}>
            {t("admin.reports.meta", {
              employer: employer.email,
              reporter: report.reporter?.email ?? t("admin.reports.deleted"),
              date: formatDateTime(report.createdAt),
            })}
          </span>
        </div>
        {report.resolvedAt ? (
          <span className={`${styles.badge} ${styles.ok}`}>
            {t("admin.reports.resolved")}
          </span>
        ) : (
          <span className={`${styles.badge} ${styles.warn}`}>
            {t("admin.reports.open")}
          </span>
        )}
      </div>

      <p className={styles.reason}>{report.reason}</p>

      <details className={styles.details}>
        <summary>
          {t("admin.reports.messages", { count: report.messages.length })}
        </summary>
        <ol className={styles.messages}>
          {report.messages.map((message) => (
            <li key={message.id} className={styles.message}>
              <span className={styles.meta}>
                {t(`admin.reports.sender.${message.sender}`)} ·{" "}
                {formatDateTime(message.createdAt)}
              </span>
              <p className={styles.body}>{message.body}</p>
            </li>
          ))}
        </ol>
      </details>

      {error && <p className={styles.error}>{errorMessage(error)}</p>}
      <div className={styles.actions}>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={togglePosition}
        >
          {position.isBlocked
            ? t("admin.reports.unblockPosition")
            : t("admin.reports.blockPosition")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={toggleEmployer}
        >
          {employer.isBlocked
            ? t("admin.reports.unblockEmployer")
            : t("admin.reports.blockEmployer")}
        </Button>
        {!report.resolvedAt && (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => run(() => resolveReport(report.id))}
          >
            {t("admin.reports.resolve")}
          </Button>
        )}
      </div>
    </li>
  );
}
