import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useInvitations } from "../hooks/useInvitations";
import { InvitationStatus } from "./InvitationStatus";
import styles from "./Invitations.module.scss";

const STATUSES = ["pending", "accepted", "declined"];

function rowTexts(invitation, t) {
  if (invitation.role === "candidate") {
    return { title: invitation.position.title, sub: null };
  }
  return {
    title: invitation.candidate.displayName || t("invitations.anonymous"),
    sub: invitation.position.title,
  };
}

function previewText(lastMessage, t) {
  if (!lastMessage) return "";
  return lastMessage.isMine
    ? t("invitations.list.you", { text: lastMessage.preview })
    : lastMessage.preview;
}

function uniquePositions(invitations) {
  const positions = new Map();
  for (const invitation of invitations) {
    positions.set(invitation.position.id, invitation.position.title);
  }
  return [...positions].map(([id, title]) => ({ id, title }));
}

export function InvitationList({ employer = false }) {
  const { t } = useTranslation();
  const { status, invitations, error, basePath } = useInvitations();
  const [searchParams, setSearchParams] = useSearchParams();
  const positionId = searchParams.get("positionId") ?? "";
  const statusFilter = searchParams.get("status") ?? "";

  function changeFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    setSearchParams(next, { replace: true });
  }

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
        {employer
          ? t("invitations.emptyEmployer")
          : t("invitations.emptyCandidate")}
      </EmptyState>
    );
  }

  const visible = invitations.filter(
    (invitation) =>
      (!positionId || invitation.position.id === positionId) &&
      (!statusFilter || invitation.status === statusFilter),
  );

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        {employer && (
          <label className={styles.field}>
            {t("invitations.filters.position")}
            <select
              className={styles.input}
              value={positionId}
              onChange={(event) =>
                changeFilter("positionId", event.target.value)
              }
            >
              <option value="">{t("invitations.filters.all")}</option>
              {uniquePositions(invitations).map((position) => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={styles.field}>
          {t("invitations.filters.status")}
          <select
            className={styles.input}
            value={statusFilter}
            onChange={(event) => changeFilter("status", event.target.value)}
          >
            <option value="">{t("invitations.filters.all")}</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(`invitations.status.${value}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState title={t("invitations.emptyFiltered")} />
      ) : (
        <ul className={styles.list}>
          {visible.map((invitation) => {
            const { title, sub } = rowTexts(invitation, t);
            return (
              <li key={invitation.id}>
                <Link
                  className={`${styles.row} ${invitation.unread ? styles.unread : ""}`}
                  to={`${basePath}/${invitation.id}`}
                >
                  <span className={styles.who}>
                    <span className={styles.name}>{title}</span>
                    {sub && <span className={styles.sub}>{sub}</span>}
                  </span>
                  <span className={styles.preview}>
                    {previewText(invitation.lastMessage, t)}
                  </span>
                  {invitation.unread && (
                    <span className={styles.badge}>
                      {t("invitations.list.new")}
                    </span>
                  )}
                  <InvitationStatus status={invitation.status} />
                  <span className={styles.date}>
                    {formatDateTime(
                      invitation.lastMessageAt ?? invitation.createdAt,
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
