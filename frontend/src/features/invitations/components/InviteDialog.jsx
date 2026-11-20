import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { inviteCandidate } from "../api/invitationsApi";
import styles from "./Invitations.module.scss";

const MAX_MESSAGE = 2000;

export function InviteDialog({
  candidate,
  positions,
  defaultPositionId,
  onClose,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const available = positions.filter((position) => !position.isBlocked);
  const [positionId, setPositionId] = useState(
    available.some((position) => position.id === defaultPositionId)
      ? defaultPositionId
      : "",
  );
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const name = candidate.displayName || t("invitations.anonymous");

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      setSent(
        await inviteCandidate(positionId, {
          candidateId: candidate.id,
          message,
        }),
      );
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
      aria-labelledby="invite-dialog-title"
      onClose={onClose}
    >
      <h2 id="invite-dialog-title" className={styles.dialogTitle}>
        {t("invitations.invite.title", { name })}
      </h2>

      {sent ? (
        <>
          <p className={styles.hint}>{t("invitations.invite.sent")}</p>
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t("invitations.invite.close")}
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/employer/invitations/${sent.id}`)}
            >
              {t("invitations.invite.openThread")}
            </Button>
          </div>
        </>
      ) : (
        <form className={styles.dialogForm} onSubmit={handleSubmit}>
          {available.length === 0 ? (
            <p className={styles.hint}>{t("invitations.invite.noPositions")}</p>
          ) : (
            <label className={styles.field}>
              {t("invitations.invite.position")}
              <select
                className={styles.input}
                value={positionId}
                required
                disabled={sending}
                onChange={(event) => setPositionId(event.target.value)}
              >
                <option value="">
                  {t("invitations.invite.choosePosition")}
                </option>
                {available.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={styles.field}>
            {t("invitations.invite.message")}
            <textarea
              className={styles.textarea}
              value={message}
              rows={5}
              maxLength={MAX_MESSAGE}
              required
              disabled={sending}
              placeholder={t("invitations.invite.messagePlaceholder")}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <p className={styles.hint}>{t("invitations.invite.hint")}</p>
          {error && <p className={styles.error}>{errorMessage(error)}</p>}
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t("invitations.invite.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!positionId || !message.trim() || sending}
            >
              {sending
                ? t("invitations.invite.sending")
                : t("invitations.invite.send")}
            </Button>
          </div>
        </form>
      )}
    </dialog>
  );
}
