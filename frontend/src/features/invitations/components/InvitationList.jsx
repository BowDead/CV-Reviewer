import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useInvitationList } from "../hooks/useInvitationList";
import { InvitationStatus } from "./InvitationStatus";
import styles from "./Invitations.module.scss";

function itemTitle(invitation, t) {
  if (invitation.role === "candidate") {
    return invitation.position.title;
  }
  return invitation.candidate.displayName || t("invitations.anonymous");
}

export function InvitationList({ positionId, basePath }) {
  const { t } = useTranslation();
  const { status, invitations, error } = useInvitationList(positionId);

  if (status === "loading") {
    return <EmptyState busy title={t("invitations.loading")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("invitations.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  if (invitations.length === 0) {
    return (
      <EmptyState title={t("invitations.emptyTitle")}>
        {positionId
          ? t("invitations.emptyEmployer")
          : t("invitations.emptyCandidate")}
      </EmptyState>
    );
  }

  return (
    <ul className={styles.list}>
      {invitations.map((invitation) => (
        <li key={invitation.id} className={styles.item}>
          <div className={styles.heading}>
            <Link
              className={styles.itemTitle}
              to={`${basePath}/${invitation.id}`}
            >
              {itemTitle(invitation, t)}
            </Link>
            <span className={styles.meta}>
              {t("invitations.lastMessage", {
                date: formatDateTime(
                  invitation.lastMessageAt ?? invitation.createdAt,
                ),
              })}
            </span>
          </div>
          <InvitationStatus status={invitation.status} />
        </li>
      ))}
    </ul>
  );
}
