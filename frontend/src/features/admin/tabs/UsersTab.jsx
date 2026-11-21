import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { UsersPanel } from "../components/UsersPanel";

export function UsersTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("admin.users.title")} />
      <UsersPanel />
    </>
  );
}
