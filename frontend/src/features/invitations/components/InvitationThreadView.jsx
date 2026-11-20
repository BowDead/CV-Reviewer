import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useThread } from "../hooks/useThread";
import { InvitationHeader } from "./InvitationHeader";
import { MessageThread } from "./MessageThread";
import { RespondPanel } from "./RespondPanel";
import styles from "./Invitations.module.scss";

function backPath(invitation) {
  if (!invitation || invitation.role === "candidate") {
    return "/invitations";
  }
  return `/employer/positions/${invitation.position.id}/invitations`;
}

export function InvitationThreadView({ invitationId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  if (status === "loading") {
    return <EmptyState busy title={t("invitations.loadingOne")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("invitations.loadOneFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  const { invitation, messages } = thread;

  return (
    <div className={styles.panel}>
      <div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(backPath(invitation))}
        >
          {t("invitations.back")}
        </Button>
      </div>
      <InvitationHeader invitation={invitation} />
      {invitation.role === "candidate" && invitation.status === "pending" && (
        <RespondPanel onRespond={respond} />
      )}
      <MessageThread
        messages={messages}
        canWrite={invitation.canWrite}
        refreshing={refreshing}
        refreshError={refreshError}
        onRefresh={refresh}
        onSend={send}
      />
    </div>
  );
}
