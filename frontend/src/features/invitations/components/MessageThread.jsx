import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import styles from "./Invitations.module.scss";

const MAX_MESSAGE = 2000;

export function MessageThread({
  messages,
  canWrite,
  refreshing,
  refreshError,
  onRefresh,
  onSend,
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await onSend(text);
      setText("");
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.label}>{t("invitations.thread.title")}</h2>
        <Button
          size="sm"
          variant="ghost"
          disabled={refreshing}
          onClick={onRefresh}
        >
          {refreshing
            ? t("invitations.thread.refreshing")
            : t("invitations.thread.refresh")}
        </Button>
      </div>
      {refreshError && (
        <p className={styles.error}>{errorMessage(refreshError)}</p>
      )}

      <ol className={styles.messages}>
        {messages.map((message) => (
          <li
            key={message.id}
            className={`${styles.message} ${message.isMine ? styles.mine : ""}`}
          >
            <span className={styles.author}>
              {message.isMine
                ? t("invitations.thread.you")
                : t(`invitations.thread.${message.sender}`)}
              {" · "}
              {formatDateTime(message.createdAt)}
            </span>
            <p className={styles.body}>{message.body}</p>
          </li>
        ))}
      </ol>

      {canWrite ? (
        <form className={styles.composer} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={text}
            rows={3}
            maxLength={MAX_MESSAGE}
            placeholder={t("invitations.thread.placeholder")}
            aria-label={t("invitations.thread.placeholder")}
            disabled={sending}
            onChange={(event) => setText(event.target.value)}
          />
          {error && <p className={styles.error}>{errorMessage(error)}</p>}
          <div className={styles.composerActions}>
            <span className={styles.counter}>
              {text.length}/{MAX_MESSAGE}
            </span>
            <Button type="submit" size="sm" disabled={!text.trim() || sending}>
              {sending
                ? t("invitations.thread.sending")
                : t("invitations.thread.send")}
            </Button>
          </div>
        </form>
      ) : (
        <p className={styles.hint}>{t("invitations.thread.closed")}</p>
      )}
    </section>
  );
}
