import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { useApiHealth } from "../hooks/useApiHealth";
import styles from "./ApiStatus.module.scss";

export function ApiStatus() {
  const { t } = useTranslation();
  const { loading, data, error } = useApiHealth();

  if (loading) {
    return <p className={styles.status}>{t("health.checking")}</p>;
  }

  if (error) {
    return (
      <p className={`${styles.status} ${styles.error}`}>
        {t("health.unavailable", { message: errorMessage(error) })}
      </p>
    );
  }

  return (
    <p className={`${styles.status} ${styles.ok}`}>
      {t("health.ok", {
        groq: t(
          data.groqConfigured ? "health.groqConfigured" : "health.groqMissing",
        ),
        database: t(
          data.databaseConnected
            ? "health.databaseConnected"
            : "health.databaseDisconnected",
        ),
      })}
    </p>
  );
}
