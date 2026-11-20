import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import styles from "./Invitations.module.scss";

const MAX_MESSAGE = 2000;

function buildTimeline(invitation, messages) {
  const items = messages.map((message) => ({
    key: message.id,
    type: "message",
    at: message.createdAt,
    message,
  }));
  if (invitation.respondedAt) {
    items.push({
      key: "response",
      type: "event",
      at: invitation.respondedAt,
    });
    items.sort((a, b) => new Date(a.at) - new Date(b.at));
  }
  return items.map((item, index) => {
    const date = new Date(item.at);
    const previous = items[index - 1];
    return {
      ...item,
      date,
      showDay:
        !previous ||
        new Date(previous.at).toDateString() !== date.toDateString(),
    };
  });
}

export function MessageThread({ invitation, messages, onSend, children }) {
  const { t, i18n } = useTranslation();
  const listRef = useRef(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const dayFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "long",
  });
  const timeFormat = new Intl.DateTimeFormat(i18n.language, {
    timeStyle: "short",
  });
  const otherName =
    invitation.role === "employer"
      ? invitation.candidate.displayName || t("invitations.anonymous")
      : t("invitations.thread.employer");

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

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
    <>
      <ol ref={listRef} className={styles.messages}>
        {buildTimeline(invitation, messages).map((item) => {
          return [
            item.showDay && (
              <li key={`day-${item.key}`} className={styles.day}>
                {dayFormat.format(item.date)}
              </li>
            ),
            item.type === "event" ? (
              <li key={item.key} className={styles.event}>
                {t(`invitations.thread.${invitation.status}`)}
                {" · "}
                {timeFormat.format(item.date)}
              </li>
            ) : (
              <li
                key={item.key}
                className={`${styles.message} ${item.message.isMine ? styles.mine : ""}`}
              >
                <p className={styles.bubble}>{item.message.body}</p>
                <span className={styles.author}>
                  {item.message.isMine
                    ? t("invitations.thread.you")
                    : otherName}
                  {" · "}
                  {timeFormat.format(item.date)}
                </span>
              </li>
            ),
          ];
        })}
      </ol>

      {children}

      {invitation.canWrite ? (
        <form className={styles.composer} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={text}
            rows={2}
            maxLength={MAX_MESSAGE}
            placeholder={t("invitations.thread.placeholder")}
            aria-label={t("invitations.thread.placeholder")}
            disabled={sending}
            onChange={(event) => setText(event.target.value)}
          />
          <Button type="submit" disabled={!text.trim() || sending}>
            {sending
              ? t("invitations.thread.sending")
              : t("invitations.thread.send")}
          </Button>
        </form>
      ) : (
        <p className={styles.closed}>{t("invitations.thread.closed")}</p>
      )}
      {error && (
        <p className={`${styles.error} ${styles.inlineError}`}>
          {errorMessage(error)}
        </p>
      )}
    </>
  );
}
