import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { OffersPanel } from "@/features/offers";

export function OffersTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("workspace.offers.title")} />
      <OffersPanel />
    </>
  );
}
