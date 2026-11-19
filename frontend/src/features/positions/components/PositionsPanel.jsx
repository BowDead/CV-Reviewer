import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { usePositions } from "../hooks/usePositions";
import { PositionCard } from "./PositionCard";
import styles from "./Positions.module.scss";

export function PositionsPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { status, positions, error, remove, removeError } = usePositions();

  const addButton = (
    <Button onClick={() => navigate("/employer/positions/new")}>
      {t("positions.add")}
    </Button>
  );

  if (status === "loading") {
    return <EmptyState busy title={t("positions.loading")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("positions.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  if (positions.length === 0) {
    return (
      <EmptyState title={t("positions.emptyTitle")} action={addButton}>
        {t("positions.emptyText")}
      </EmptyState>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <p className={styles.summary}>
          {t("positions.summary", { count: positions.length })}
        </p>
        {addButton}
      </div>
      {removeError && (
        <p className={styles.error}>{errorMessage(removeError)}</p>
      )}
      <ul className={styles.list}>
        {positions.map((position) => (
          <PositionCard
            key={position.id}
            position={position}
            onRemove={remove}
          />
        ))}
      </ul>
    </div>
  );
}
