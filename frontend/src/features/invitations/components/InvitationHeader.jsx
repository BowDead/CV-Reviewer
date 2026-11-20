import { useTranslation } from "react-i18next";
import { sharedCvUrl } from "../api/invitationsApi";
import { InvitationStatus } from "./InvitationStatus";
import styles from "./Invitations.module.scss";

function CandidateSide({ invitation }) {
  const { t } = useTranslation();
  const { position } = invitation;

  return (
    <>
      <div className={styles.cardHeader}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{position.title}</h2>
          {position.url && (
            <a
              className={styles.link}
              href={position.url}
              target="_blank"
              rel="noreferrer"
            >
              {t("invitations.header.positionLink")}
            </a>
          )}
        </div>
        <InvitationStatus status={invitation.status} />
      </div>
      <details className={styles.details}>
        <summary>{t("invitations.header.description")}</summary>
        <p className={styles.description}>{position.description}</p>
      </details>
      {invitation.status === "accepted" && (
        <p className={styles.hint}>{t("invitations.header.cvShared")}</p>
      )}
    </>
  );
}

function EmployerSide({ invitation }) {
  const { t } = useTranslation();
  const { candidate, position } = invitation;
  const meta = [candidate.seniority, candidate.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className={styles.cardHeader}>
        <div className={styles.heading}>
          <h2 className={styles.title}>
            {candidate.displayName || t("invitations.anonymous")}
          </h2>
          {candidate.headline && (
            <span className={styles.meta}>{candidate.headline}</span>
          )}
          {meta && <span className={styles.meta}>{meta}</span>}
          <span className={styles.meta}>
            {t("invitations.header.position", { title: position.title })}
          </span>
        </div>
        <InvitationStatus status={invitation.status} />
      </div>
      {invitation.status === "accepted" && (
        <div className={styles.contact}>
          {candidate.email && (
            <span>
              {t("invitations.header.email")}{" "}
              <a className={styles.link} href={`mailto:${candidate.email}`}>
                {candidate.email}
              </a>
            </span>
          )}
          {invitation.hasSharedCv ? (
            <a className={styles.download} href={sharedCvUrl(invitation.id)}>
              {t("invitations.header.downloadCv")}
            </a>
          ) : (
            <span className={styles.hint}>
              {t("invitations.header.cvRemoved")}
            </span>
          )}
        </div>
      )}
    </>
  );
}

export function InvitationHeader({ invitation }) {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      {invitation.role === "candidate" ? (
        <CandidateSide invitation={invitation} />
      ) : (
        <EmployerSide invitation={invitation} />
      )}
      {invitation.position.isBlocked && (
        <p className={styles.error}>{t("invitations.header.blocked")}</p>
      )}
    </section>
  );
}
