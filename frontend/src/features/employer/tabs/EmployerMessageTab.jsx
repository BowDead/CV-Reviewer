import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { InvitationList } from "@/features/invitations";

export function EmployerMessagesTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("employer.messages.title")} />
      <InvitationList employer />
    </>
  );
}
