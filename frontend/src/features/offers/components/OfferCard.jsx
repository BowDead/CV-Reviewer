import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { TagList } from "@/shared/ui/TagList";
import styles from "./Offers.module.scss";

export function OfferCard({ offer, insight, onExplain }) {
  const { t } = useTranslation();
  const { match } = offer;

  return (
    <li className={styles.offer}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <a
            className={styles.title}
            href={offer.url}
            target="_blank"
            rel="noreferrer"
          >
            {offer.title}
          </a>
          <span className={styles.meta}>
            {[offer.company, offer.location].filter(Boolean).join(" · ")}
          </span>
        </div>
        <span className={styles.score}>
          {match.score}%
          <span className={styles.scoreLabel}>{t("offers.match")}</span>
        </span>
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

      <div className={styles.insight} aria-live="polite">
        {insight?.status === "done" && (
          <p className={styles.comment}>{insight.comment}</p>
        )}
        {insight?.status === "error" && (
          <p className={styles.error}>{errorMessage(insight.error)}</p>
        )}
        {insight?.status !== "done" && (
          <Button
            size="sm"
            variant="ghost"
            disabled={insight?.status === "loading"}
            onClick={() => onExplain(offer.offerKey)}
          >
            {insight?.status === "loading"
              ? t("offers.explaining")
              : t("offers.explain")}
          </Button>
        )}
      </div>
    </li>
  );
}
