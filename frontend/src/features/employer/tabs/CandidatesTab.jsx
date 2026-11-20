import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/shared/ui/Button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CandidatesPanel } from "@/features/candidates";
import { InviteDialog, useInvitations } from "@/features/invitations";
import { usePositions } from "@/features/positions";

export function CandidatesTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { positions } = usePositions();
  const { invitations, basePath } = useInvitations();
  const [inviting, setInviting] = useState(null);
  const positionId = searchParams.get("positionId");

  function findInvitation(candidate) {
    if (!positionId) return null;
    return invitations.find(
      (invitation) =>
        invitation.candidate.id === candidate.id &&
        invitation.position.id === positionId,
    );
  }

  return (
    <>
      <PageHeader title={t("employer.candidates.title")} />
      <CandidatesPanel
        positions={positions}
        renderActions={(candidate) => {
          const invitation = findInvitation(candidate);
          return invitation ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`${basePath}/${invitation.id}`)}
            >
              {t("employer.candidates.openThread")}
            </Button>
          ) : (
            <Button size="sm" onClick={() => setInviting(candidate)}>
              {t("employer.candidates.invite")}
            </Button>
          );
        }}
      />
      {inviting && (
        <InviteDialog
          candidate={inviting}
          positions={positions}
          defaultPositionId={positionId}
          onClose={() => setInviting(null)}
        />
      )}
    </>
  );
}
