import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/shared/ui/Button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { AnalysisDetail } from "@/features/analysis-history";
import styles from "./tabs.module.scss";

export function HistoryDetailTab() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t("workspace.historyDetail.title")}
        description={t("workspace.historyDetail.description")}
      />
      <div className={styles.toolbar}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
          {t("workspace.historyDetail.back")}
        </Button>
      </div>
      <AnalysisDetail id={id} />
    </>
  );
}
