import { useTranslation } from "react-i18next";
import styles from "./Invitations.module.scss";

export function InvitationStatus({ status }) {
  const { t } = useTranslation();

  return (
    <span className={`${styles.status} ${styles[status]}`}>
      {t(`invitations.status.${status}`)}
    </span>
  );
}
