import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { TagList } from "@/shared/ui/TagList";
import { useInvitations } from "@/features/invitations";
import styles from "./Positions.module.scss";

export function PositionCard({ position, onRemove }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { invitations, basePath } = useInvitations();
  const conversations = invitations.filter(
    (invitation) => invitation.position.id === position.id,
  );
  const unread = conversations.filter((invitation) => invitation.unread).length;
  const required = position.skills.filter((skill) => skill.isRequired);
  const niceToHave = position.skills.filter((skill) => !skill.isRequired);

  function handleRemove() {
    if (
      window.confirm(t("positions.confirmRemove", { title: position.title }))
    ) {
      onRemove(position.id);
    }
  }

  return (
    <li className={styles.position}>
      <div className={styles.cardHeader}>
        <div className={styles.heading}>
          <Link
            className={styles.title}
            to={`/employer/positions/${position.id}`}
          >
            {position.title}
          </Link>
          <span className={styles.meta}>
            {t("positions.meta", {
              required: required.length,
              niceToHave: niceToHave.length,
              date: formatDateTime(position.updatedAt),
            })}
          </span>
        </div>
        {position.isBlocked && (
          <span className={styles.blocked}>{t("positions.blocked")}</span>
        )}
      </div>
      <TagList items={required.map((skill) => skill.name)} />
      <div className={styles.cardActions}>
        <Button
          size="sm"
          onClick={() =>
            navigate(`/employer/candidates?positionId=${position.id}`)
          }
        >
          {t("positions.findCandidates")}
        </Button>
        {conversations.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`${basePath}?positionId=${position.id}`)}
          >
            {t("positions.conversations", { count: conversations.length })}
            {unread > 0 && (
              <span className={styles.unread}>
                {t("positions.unread", { count: unread })}
              </span>
            )}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={handleRemove}>
          {t("positions.remove")}
        </Button>
      </div>
    </li>
  );
}
