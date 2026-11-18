import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { GithubPanel } from "@/features/github";

export function GithubTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t("workspace.github.title")} />
      <GithubPanel />
    </>
  );
}
