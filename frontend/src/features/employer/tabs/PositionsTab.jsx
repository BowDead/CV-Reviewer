import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PositionsPanel } from "@/features/positions";

export function PositionsTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("employer.positions.title")} />
      <PositionsPanel />
    </>
  );
}
