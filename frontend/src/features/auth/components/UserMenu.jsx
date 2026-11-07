import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "../hooks/useAuth";
import styles from "./UserMenu.module.scss";

export function UserMenu() {
  const { t } = useTranslation();
  const { status, user, logout } = useAuth();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className={styles.menu}>
      <div className={styles.user}>
        <span className={styles.email}>{user.email}</span>
        <span className={styles.role}>{t(`roles.${user.role}`)}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={logout}>
        {t("auth.logout")}
      </Button>
    </div>
  );
}
