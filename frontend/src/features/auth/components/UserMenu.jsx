import { Button } from "@/shared/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS } from "../constants";
import styles from "./UserMenu.module.scss";

export function UserMenu() {
  const { status, user, logout } = useAuth();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className={styles.menu}>
      <div className={styles.user}>
        <span className={styles.email}>{user.email}</span>
        <span className={styles.role}>{ROLE_LABELS[user.role]}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={logout}>
        Wyloguj
      </Button>
    </div>
  );
}
