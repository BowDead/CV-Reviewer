import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { Button } from "@/shared/ui/Button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CandidatesPanel } from "@/features/candidates";
import { InviteDialog } from "@/features/invitations";
import { usePositions } from "@/features/positions";

export function CandidatesTab() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { positions } = usePositions();
  const [inviting, setInviting] = useState(null);

  return (
    <>
      <PageHeader title={t("employer.candidates.title")} />
      <CandidatesPanel
        positions={positions}
        renderActions={(candidate) => (
          <Button size="sm" onClick={() => setInviting(candidate)}>
            {t("employer.candidates.invite")}
          </Button>
        )}
      />
      {inviting && (
        <InviteDialog
          candidate={inviting}
          positions={positions}
          defaultPositionId={searchParams.get("positionId")}
          onClose={() => setInviting(null)}
        />
      )}
    </>
  );
}
