import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { reportInvitation } from "../api/invitationsApi";
import styles from "./Invitations.module.scss";

const MAX_REASON = 1000;

export function ReportDialog({ invitationId, onClose }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await reportInvitation(invitationId, reason);
      setSent(true);
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="report-dialog-title"
      onClose={onClose}
    >
      <h2 id="report-dialog-title" className={styles.dialogTitle}>
        {t("invitations.report.title")}
      </h2>
      {sent ? (
        <>
          <p className={styles.hint}>{t("invitations.report.sent")}</p>
          <div className={styles.actions}>
            <Button size="sm" onClick={onClose}>
              {t("invitations.report.close")}
            </Button>
          </div>
        </>
      ) : (
        <form className={styles.dialogForm} onSubmit={handleSubmit}>
          <p className={styles.hint}>{t("invitations.report.hint")}</p>
          <label className={styles.field}>
            {t("invitations.report.reason")}
            <textarea
              className={styles.textarea}
              value={reason}
              rows={4}
              maxLength={MAX_REASON}
              required
              disabled={sending}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          {error && <p className={styles.error}>{errorMessage(error)}</p>}
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t("invitations.report.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!reason.trim() || sending}
            >
              {sending
                ? t("invitations.report.sending")
                : t("invitations.report.send")}
            </Button>
          </div>
        </form>
      )}
    </dialog>
  );
}
