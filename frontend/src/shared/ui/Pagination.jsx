import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import styles from "./Pagination.module.scss";

export function Pagination({ page, pageCount, onChange }) {
  const { t } = useTranslation();

  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label={t("pagination.label")}>
      <Button
        size="sm"
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t("pagination.previous")}
      </Button>
      <span className={styles.status} aria-live="polite">
        {t("pagination.status", { page, pageCount })}
      </span>
      <Button
        size="sm"
        variant="ghost"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        {t("pagination.next")}
      </Button>
    </nav>
  );
}
