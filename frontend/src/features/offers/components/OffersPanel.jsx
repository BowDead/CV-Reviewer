import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Pagination } from "@/shared/ui/Pagination";
import { useOffers } from "../hooks/useOffers";
import { OfferCard } from "./OfferCard";
import styles from "./Offers.module.scss";

const PAGE_SIZE = 10;

function readPage(searchParams, pageCount) {
  const page = Number.parseInt(searchParams.get("page"), 10) || 1;
  return Math.min(Math.max(page, 1), Math.max(pageCount, 1));
}

export function OffersPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { status, offers, error } = useOffers();

  const pageCount = Math.ceil(offers.length / PAGE_SIZE);
  const page = readPage(searchParams, pageCount);
  const pageOffers = offers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changePage(nextPage) {
    setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});
    panelRef.current?.scrollIntoView({ block: "start" });
  }

  if (status === "loading") {
    return (
      <EmptyState busy title={t("offers.loading")}>
        {t("offers.loadingText")}
      </EmptyState>
    );
  }

  if (status === "error" && error.code === "PROFILE_NOT_FOUND") {
    return (
      <EmptyState
        title={t("offers.noProfileTitle")}
        action={
          <Button onClick={() => navigate("/profile")}>
            {t("offers.goToProfile")}
          </Button>
        }
      >
        {t("offers.noProfileText")}
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
    <div className={styles.panel} ref={panelRef}>
      <p className={styles.summary}>
        {t("offers.summary", { count: offers.length })}
      </p>
      <ul className={styles.list}>
        {pageOffers.map((offer) => (
          <OfferCard key={offer.offerKey} offer={offer} />
        ))}
      </ul>
      <Pagination page={page} pageCount={pageCount} onChange={changePage} />
    </div>
  );
}
