import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import styles from "./Offers.module.scss";

export function OfferInsight({ insight, onExplain }) {
  const { t } = useTranslation();

  return (
    <section className={styles.section} aria-live="polite">
      <h3 className={styles.sectionLabel}>{t("offers.insightTitle")}</h3>
      {insight?.status === "done" && (
        <p className={styles.comment}>{insight.comment}</p>
      )}
      {insight?.status === "error" && (
        <p className={styles.error}>{errorMessage(insight.error)}</p>
      )}
      {insight?.status !== "done" && (
        <div>
          <Button
            size="sm"
            variant="ghost"
            disabled={insight?.status === "loading"}
            onClick={onExplain}
          >
            {insight?.status === "loading"
              ? t("offers.explaining")
              : t("offers.explain")}
          </Button>
        </div>
      )}
    </section>
  );
}
