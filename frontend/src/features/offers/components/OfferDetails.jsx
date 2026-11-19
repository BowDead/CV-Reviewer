import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { TagList } from "@/shared/ui/TagList";
import { useOfferDetails } from "../hooks/useOfferDetails";
import { OfferInsight } from "./OfferInsight";
import { OfferRepositories } from "./OfferRepositories";
import { OfferScore } from "./OfferScore";
import styles from "./Offers.module.scss";

function SkillRow({ label, items, tone }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className={styles.skills}>
      <span className={styles.skillsLabel}>{label}</span>
      <TagList items={items} tone={tone} />
    </div>
  );
}

export function OfferDetails({ offerKey }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, offer, error, insight, explain } = useOfferDetails(offerKey);

  const back = (
    <div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate(`/offers${location.state?.fromList ?? ""}`)}
      >
        {t("offers.back")}
      </Button>
    </div>
  );

  if (status === "loading") {
    return <EmptyState busy title={t("offers.detailsLoading")} />;
  }

  if (status === "error") {
    return (
      <div className={styles.panel}>
        {back}
        <EmptyState tone="error" title={t("offers.detailsFailed")}>
          {errorMessage(error)}
        </EmptyState>
      </div>
    );
  }

  const { match } = offer;
  const niceToHave = offer.niceToHaveSkills.filter(
    (name) => !match.matched.includes(name),
  );
  const meta = [offer.company, offer.location, offer.experienceLevel]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={styles.panel}>
      {back}

      <section className={styles.offer}>
        <div className={styles.header}>
          <div className={styles.heading}>
            <h2 className={styles.detailsTitle}>{offer.title}</h2>
            {meta && <span className={styles.meta}>{meta}</span>}
          </div>
          <OfferScore score={match.score} />
        </div>
        <SkillRow
          label={t("offers.matched")}
          items={match.matched}
          tone="success"
        />
        <SkillRow label={t("offers.missing")} items={match.missing} />
        <SkillRow label={t("offers.niceToHave")} items={niceToHave} />
        <OfferRepositories offerKey={offer.offerKey} />
        {offer.url && (
          <div>
            <a
              className={styles.external}
              href={offer.url}
              target="_blank"
              rel="noreferrer"
            >
              {t("offers.openExternal")}
            </a>
          </div>
        )}
      </section>

      <OfferInsight insight={insight} onExplain={explain} />

      {offer.description && (
        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>{t("offers.description")}</h3>
          <p className={styles.description}>{offer.description}</p>
        </section>
      )}
    </div>
  );
}
