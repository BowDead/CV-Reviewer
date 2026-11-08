import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useLlmKeys } from "../hooks/useLlmKeys";
import { LlmKeyForm } from "./LlmKeyForm";
import { LlmKeyList } from "./LlmKeyList";
import styles from "./LlmKeys.module.scss";

export function LlmKeysPanel() {
  const { t } = useTranslation();
  const { status, keys, providers, error, actionError, add, remove, reorder } =
    useLlmKeys();

  if (status === "loading") {
    return <EmptyState busy title={t("llmKeys.loading")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("llmKeys.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  return (
    <div className={styles.panel}>
      <div aria-live="polite">
        {actionError && (
          <p className={styles.error}>{errorMessage(actionError)}</p>
        )}
      </div>
      <LlmKeyList
        keys={keys}
        providers={providers}
        onRemove={remove}
        onReorder={reorder}
      />
      <LlmKeyForm providers={providers} onAdd={add} />
    </div>
  );
}
