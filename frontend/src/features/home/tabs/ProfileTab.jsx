import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ProfileSummary } from "@/features/cv-analysis";
import { ProfilePanel } from "@/features/profile";
import { useWorkspace } from "./useWorkspace";
import styles from "./ProfileTab.module.scss";

export function ProfileTab() {
  const { t } = useTranslation();
  const { analysis } = useWorkspace();
  const analysisProfile =
    analysis.status === "done" ? analysis.result?.analysis.profile : null;

  return (
    <>
      <PageHeader title={t("workspace.profile.title")} />
      <ProfilePanel />
      {analysisProfile && (
        <section className={styles.analysisData}>
          <h2 className={styles.label}>{t("candidateProfile.analysisData")}</h2>
          <ProfileSummary profile={analysisProfile} />
        </section>
      )}
    </>
  );
}
