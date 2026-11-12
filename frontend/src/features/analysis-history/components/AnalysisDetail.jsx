import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { EmptyState } from "@/shared/ui/EmptyState";
import {
  CvAnalysisResult,
  CvImprovements,
  ProfileSummary,
} from "@/features/cv-analysis";
import { useAnalysisDetail } from "../hooks/useAnalysisDetail";
import styles from "./AnalysisHistory.module.scss";

export function AnalysisDetail({ id }) {
  const { t } = useTranslation();
  const { status, analysis, error } = useAnalysisDetail(id);

  if (status === "loading") {
    return <EmptyState busy title={t("analysisHistory.loadingDetail")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("analysisHistory.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  const { result } = analysis;

  return (
    <div className={styles.detail}>
      <p className={styles.source}>
        {[
          analysis.fileName ?? t("analysisHistory.noFileName"),
          formatDateTime(analysis.createdAt),
          analysis.model,
        ].join(" · ")}
      </p>

      <CvAnalysisResult result={result} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {t("workspace.improvements.title")}
        </h2>
        <CvImprovements analysis={result.analysis} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("workspace.profile.title")}</h2>
        <ProfileSummary profile={result.analysis.profile} />
      </section>
    </div>
  );
}
