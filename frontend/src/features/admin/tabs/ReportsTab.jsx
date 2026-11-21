import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ReportsPanel } from "../components/ReportsPanel";

export function ReportsTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("admin.reports.title")} />
      <ReportsPanel />
    </>
  );
}
