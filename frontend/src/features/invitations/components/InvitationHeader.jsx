import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "@/shared/ui/Button";
import { sharedCvUrl } from "../api/invitationsApi";
import { InvitationStatus } from "./InvitationStatus";
import { ReportDialog } from "./ReportDialog";
import styles from "./Invitations.module.scss";

function EmployerHeading({ invitation }) {
  const { t } = useTranslation();
  const { candidate, position } = invitation;
  const meta = [candidate.headline, candidate.seniority, candidate.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={styles.heading}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>
          {candidate.displayName || t("invitations.anonymous")}
        </h2>
        <InvitationStatus status={invitation.status} />
      </div>
      {meta && <span className={styles.meta}>{meta}</span>}
      <span className={styles.meta}>
        {t("invitations.header.position")}{" "}
        <Link className={styles.link} to={`/employer/positions/${position.id}`}>
          {position.title}
        </Link>
      </span>
    </div>
  );
}

function CandidateHeading({ invitation, showDescription, onToggle }) {
  const { t } = useTranslation();
  const { position } = invitation;

  return (
    <div className={styles.heading}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{position.title}</h2>
        <InvitationStatus status={invitation.status} />
      </div>
      <div className={styles.links}>
        <button
          type="button"
          className={styles.linkButton}
          aria-expanded={showDescription}
          onClick={onToggle}
        >
          {t("invitations.header.description")}
        </button>
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
      {invitation.status === "accepted" && (
        <span className={styles.meta}>{t("invitations.header.cvShared")}</span>
      )}
    </div>
  );
}

function EmployerContact({ invitation }) {
  const { t } = useTranslation();
  const { candidate } = invitation;

  if (invitation.status !== "accepted") return null;

  return (
    <>
      {candidate.email && (
        <a className={styles.contact} href={`mailto:${candidate.email}`}>
          {candidate.email}
        </a>
      )}
      {invitation.hasSharedCv ? (
        <a className={styles.download} href={sharedCvUrl(invitation.id)}>
          {t("invitations.header.downloadCv")}
        </a>
      ) : (
        <span className={styles.meta}>{t("invitations.header.cvRemoved")}</span>
      )}
    </>
  );
}

export function InvitationHeader({ invitation, refreshing, onRefresh }) {
  const { t } = useTranslation();
  const [showDescription, setShowDescription] = useState(false);
  const [reporting, setReporting] = useState(false);
  const isCandidate = invitation.role === "candidate";

  return (
    <>
      <div className={styles.header}>
        {isCandidate ? (
          <CandidateHeading
            invitation={invitation}
            showDescription={showDescription}
            onToggle={() => setShowDescription((value) => !value)}
          />
        ) : (
          <EmployerHeading invitation={invitation} />
        )}
        <div className={styles.headerActions}>
          {!isCandidate && <EmployerContact invitation={invitation} />}
          {isCandidate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReporting(true)}
            >
              {t("invitations.report.open")}
            </Button>
          )}
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
      </div>
      {isCandidate && showDescription && (
        <p className={styles.description}>{invitation.position.description}</p>
      )}
      {invitation.position.isBlocked && (
        <p className={styles.notice}>{t("invitations.header.blocked")}</p>
      )}
      {reporting && (
        <ReportDialog
          invitationId={invitation.id}
          onClose={() => setReporting(false)}
        />
      )}
    </>
  );
}
