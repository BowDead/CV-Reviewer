import { useTranslation } from "react-i18next";
import { PageHeader } from "@/shared/ui/PageHeader";
import { LlmKeysPanel } from "@/features/llm-keys";

export function KeysTab() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t("workspace.keys.title")}
        description={t("workspace.keys.description")}
      />
      <LlmKeysPanel />
    </>
  );
}
