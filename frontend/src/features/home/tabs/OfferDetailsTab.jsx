import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { PageHeader } from "@/shared/ui/PageHeader";
import { OfferDetails } from "@/features/offers";

export function OfferDetailsTab() {
  const { t } = useTranslation();
  const { offerKey } = useParams();

  return (
    <>
      <PageHeader title={t("workspace.offers.title")} />
      <OfferDetails key={offerKey} offerKey={offerKey} />
    </>
  );
}
