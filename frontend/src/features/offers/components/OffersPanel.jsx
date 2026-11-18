import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useOffers } from "../hooks/useOffers";
import { OfferCard } from "./OfferCard";
import styles from "./Offers.module.scss";

export function OffersPanel({ analysisId }) {
  const { t } = useTranslation();
  const { status, offers, error, insights, explain } = useOffers(analysisId);

  if (status === "loading") {
    return (
      <EmptyState busy title={t("offers.loading")}>
        {t("offers.loadingText")}
      </EmptyState>
    );
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("offers.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  if (offers.length === 0) {
    return (
      <EmptyState title={t("offers.emptyTitle")}>
        {t("offers.emptyText")}
      </EmptyState>
    );
  }

  return (
    <div className={styles.panel}>
      <p className={styles.summary}>
        {t("offers.summary", { count: offers.length })}
      </p>
      <ul className={styles.list}>
        {offers.map((offer) => (
          <OfferCard
            key={offer.offerKey}
            offer={offer}
            insight={insights[offer.offerKey]}
            onExplain={explain}
          />
        ))}
      </ul>
    </div>
  );
}
