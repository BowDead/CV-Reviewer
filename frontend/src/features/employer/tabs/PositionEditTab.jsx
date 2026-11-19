import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PositionEditor } from "@/features/positions";

export function PositionEditTab() {
  const { t } = useTranslation();
  const { positionId } = useParams();

  return (
    <>
      <PageHeader
        title={
          positionId
            ? t("employer.positions.editTitle")
            : t("employer.positions.newTitle")
        }
      />
      <PositionEditor key={positionId ?? "new"} positionId={positionId} />
    </>
  );
}
