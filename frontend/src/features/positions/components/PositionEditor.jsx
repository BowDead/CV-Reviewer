import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { usePosition } from "../hooks/usePosition";
import { PositionForm } from "./PositionForm";
import styles from "./Positions.module.scss";

const LIST_PATH = "/employer/positions";

export function PositionEditor({ positionId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { status, position, error } = usePosition(positionId);

  if (status === "loading") {
    return <EmptyState busy title={t("positions.loadingOne")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("positions.loadOneFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  return (
    <div className={styles.panel}>
      {position?.isBlocked && (
        <p className={styles.error}>{t("positions.blockedText")}</p>
      )}
      <PositionForm
        position={position}
        onSaved={() => navigate(LIST_PATH)}
        onCancel={() => navigate(LIST_PATH)}
      />
    </div>
  );
}
