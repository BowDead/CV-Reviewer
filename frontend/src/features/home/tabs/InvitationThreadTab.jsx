import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { PageHeader } from "@/shared/ui/PageHeader";
import { InvitationThreadView } from "@/features/invitations";

export function InvitationThreadTab() {
  const { t } = useTranslation();
  const { invitationId } = useParams();

  return (
    <>
      <PageHeader title={t("workspace.messages.title")} />
      <InvitationThreadView key={invitationId} invitationId={invitationId} />
    </>
  );
}
