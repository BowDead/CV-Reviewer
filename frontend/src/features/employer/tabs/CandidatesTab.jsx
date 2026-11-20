import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CandidatesPanel } from "@/features/candidates";

export function CandidatesTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("employer.candidates.title")} />
      <CandidatesPanel />
    </>
  );
}
