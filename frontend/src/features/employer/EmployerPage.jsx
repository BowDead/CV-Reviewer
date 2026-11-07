import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";

export function EmployerPage() {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t("employer.title")}
      description={t("employer.description")}
    />
  );
}
