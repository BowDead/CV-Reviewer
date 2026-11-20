import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useCandidates } from "../hooks/useCandidates";
import { CandidateCard } from "./CandidateCard";
import styles from "./Candidates.module.scss";

export function CandidateResults({ query, ranked, renderActions }) {
  const { t } = useTranslation();
  const { status, candidates, error } = useCandidates(query);

  if (status === "loading") {
    return <EmptyState busy title={t("candidates.loading")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("candidates.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  if (candidates.length === 0) {
    return (
      <EmptyState title={t("candidates.emptyTitle")}>
        {t("candidates.emptyText")}
      </EmptyState>
    );
  }

  return (
    <div className={styles.results}>
      <p className={styles.summary}>
        {t(ranked ? "candidates.summaryRanked" : "candidates.summary", {
          count: candidates.length,
        })}
      </p>
      <ul className={styles.list}>
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            actions={renderActions?.(candidate)}
          />
        ))}
      </ul>
    </div>
  );
}
