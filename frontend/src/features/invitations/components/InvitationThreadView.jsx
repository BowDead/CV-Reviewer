import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useInvitations } from "../hooks/useInvitations";
import { useThread } from "../hooks/useThread";
import { InvitationHeader } from "./InvitationHeader";
import { MessageThread } from "./MessageThread";
import { RespondPanel } from "./RespondPanel";
import styles from "./Invitations.module.scss";

export function InvitationThreadView({ invitationId }) {
  const { t } = useTranslation();
  const { basePath, markRead, reload } = useInvitations();
  const {
    status,
    thread,
    error,
    refreshing,
    refreshError,
    refresh,
    send,
    respond,
  } = useThread(invitationId);

  useEffect(() => {
    if (thread) markRead(invitationId);
  }, [thread, invitationId, markRead]);

  async function sendAndReload(text) {
    await send(text);
    reload();
  }

  async function respondAndReload(body) {
    await respond(body);
    reload();
  }

  const back = (
    <Link className={styles.back} to={basePath}>
      {t("invitations.back")}
    </Link>
  );

  if (status === "loading") {
    return <EmptyState busy title={t("invitations.loadingOne")} />;
  }

  if (status === "error") {
    return (
      <div className={styles.panel}>
        {back}
        <EmptyState tone="error" title={t("invitations.loadOneFailed")}>
          {errorMessage(error)}
        </EmptyState>
      </div>
    );
  }

  const { invitation, messages } = thread;

  return (
    <div className={styles.panel}>
      {back}
      <section className={styles.conversation}>
        <InvitationHeader
          invitation={invitation}
          refreshing={refreshing}
          onRefresh={refresh}
        />
        {refreshError && (
          <p className={`${styles.error} ${styles.inlineError}`}>
            {errorMessage(refreshError)}
          </p>
        )}
        <MessageThread
          invitation={invitation}
          messages={messages}
          onSend={sendAndReload}
        >
          {invitation.role === "candidate" &&
            invitation.status === "pending" && (
              <RespondPanel onRespond={respondAndReload} />
            )}
        </MessageThread>
      </section>
    </div>
  );
}
