import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { PageHeader } from "@/shared/ui/PageHeader";
import { InvitationList } from "@/features/invitations";

export function PositionInvitationsTab() {
  const { t } = useTranslation();
  const { positionId } = useParams();

  return (
    <>
      <PageHeader title={t("employer.invitations.positionTitle")} />
      <InvitationList
        key={positionId}
        positionId={positionId}
        basePath="/employer/invitations"
      />
    </>
  );
}
