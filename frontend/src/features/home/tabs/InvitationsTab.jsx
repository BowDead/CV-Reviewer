import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { InvitationList } from "@/features/invitations";

export function InvitationsTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("workspace.messages.title")} />
      <InvitationList />
    </>
  );
}
