import { useTranslation } from "react-i18next";
import styles from "./Offers.module.scss";

export function OfferScore({ score }) {
  const { t } = useTranslation();

  return (
    <span className={styles.score}>
      {score}%<span className={styles.scoreLabel}>{t("offers.match")}</span>
    </span>
  );
}
