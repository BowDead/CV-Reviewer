import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useAnalysisChoices } from "../hooks/useAnalysisChoices";
import { useProfile } from "../hooks/useProfile";
import { AnalysisPicker } from "./AnalysisPicker";
import { ProfileCard } from "./ProfileCard";
import { ProfileFieldsForm } from "./ProfileFieldsForm";
import { ProfileSkillsEditor } from "./ProfileSkillsEditor";
import styles from "./Profile.module.scss";

export function ProfilePanel() {
  const { t } = useTranslation();
  const profile = useProfile();
  const choices = useAnalysisChoices();
  const [pickerOpen, setPickerOpen] = useState(false);

  const current = profile.profile;
  const source = current
    ? choices.analyses.find(
        (analysis) => analysis.id === current.sourceAnalysisId,
      )
    : null;

  const picker = pickerOpen && (
    <AnalysisPicker
      choices={choices}
      sourceId={current?.sourceAnalysisId ?? null}
      hasProfile={Boolean(current)}
      saving={profile.saving}
      onConfirm={profile.chooseAnalysis}
      onClose={() => setPickerOpen(false)}
    />
  );

  const actionError = profile.actionError && (
    <p className={styles.error} role="alert">
      {errorMessage(profile.actionError)}
    </p>
  );

  if (profile.status === "loading") {
    return <EmptyState busy title={t("candidateProfile.loading")} />;
  }

  if (profile.status === "error") {
    return (
      <EmptyState tone="error" title={t("candidateProfile.loadFailed")}>
        {errorMessage(profile.error)}
      </EmptyState>
    );
  }

  if (profile.status === "none") {
    return (
      <>
        <EmptyState
          title={t("candidateProfile.emptyTitle")}
          action={
            <Button onClick={() => setPickerOpen(true)}>
              {t("candidateProfile.chooseAnalysis")}
            </Button>
          }
        >
          {t("candidateProfile.emptyText")}
        </EmptyState>
        {actionError}
        {picker}
      </>
    );
  }

  return (
    <div className={styles.panel}>
      <ProfileCard
        profile={current}
        saving={profile.saving}
        onPublishChange={profile.setPublished}
      />

      <div className={styles.source}>
        <span>
          {source
            ? t("candidateProfile.source", {
                date: formatDateTime(source.createdAt),
              })
            : t("candidateProfile.sourceUnknown")}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
          {t("candidateProfile.changeAnalysis")}
        </Button>
      </div>

      {actionError}

      <ProfileFieldsForm
        key={[current.displayName, current.headline, current.location].join(
          "|",
        )}
        profile={current}
        saving={profile.saving}
        onSave={profile.updateFields}
      />

      <ProfileSkillsEditor
        skills={current.skills}
        saving={profile.saving}
        onChange={profile.setSkills}
      />

      {picker}
    </div>
  );
}
