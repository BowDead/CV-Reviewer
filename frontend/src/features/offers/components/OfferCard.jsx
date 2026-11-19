import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { TagList } from "@/shared/ui/TagList";
import { OfferScore } from "./OfferScore";
import styles from "./Offers.module.scss";

export function OfferCard({ offer }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { match } = offer;

  return (
    <li className={styles.offer}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <Link
            className={styles.title}
            to={`/offers/${offer.offerKey}`}
            state={{ fromList: location.search }}
          >
            {offer.title}
          </Link>
          <span className={styles.meta}>
            {[offer.company, offer.location].filter(Boolean).join(" · ")}
          </span>
        </div>
        <OfferScore score={match.score} />
      </div>

      {match.matched.length > 0 && (
        <div className={styles.skills}>
          <span className={styles.skillsLabel}>{t("offers.matched")}</span>
          <TagList items={match.matched} tone="success" />
        </div>
      )}
      {match.missing.length > 0 && (
        <div className={styles.skills}>
          <span className={styles.skillsLabel}>{t("offers.missing")}</span>
          <TagList items={match.missing} />
        </div>
      )}
    </li>
  );
}
