import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CvAnalysisResult } from "@/features/cv-analysis";
import { GithubSkillsMatch } from "@/features/github";
import { useWorkspace } from "./useWorkspace";
import { AnalysisGate } from "./AnalysisGate";
import styles from "./tabs.module.scss";

export function AnalysisTab() {
  const { t } = useTranslation();
  const workspace = useWorkspace();

  return (
    <>
      <PageHeader title={t("workspace.analysis.title")} />
      <AnalysisGate {...workspace}>
        {(result) => (
          <>
            {result.cached && (
              <p className={styles.notice}>
                {t("cvAnalysis.cached", {
                  date: formatDateTime(result.analyzedAt),
                })}
              </p>
            )}
            <CvAnalysisResult result={result} />
            <GithubSkillsMatch
              cvSkills={result.skills.map((skill) => skill.name)}
            />
          </>
        )}
      </AnalysisGate>
    </>
  );
}
