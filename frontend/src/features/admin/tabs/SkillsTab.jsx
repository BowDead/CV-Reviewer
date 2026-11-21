import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SkillsPanel } from "../components/SkillsPanel";

export function SkillsTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("admin.skills.title")} />
      <SkillsPanel />
    </>
  );
}
