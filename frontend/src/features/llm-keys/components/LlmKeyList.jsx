import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import styles from "./LlmKeys.module.scss";

function moveId(ids, index, offset) {
  const next = [...ids];
  [next[index], next[index + offset]] = [next[index + offset], next[index]];
  return next;
}

export function LlmKeyList({ keys, providers, onRemove, onReorder }) {
  const { t } = useTranslation();

  if (!keys.length) {
    return (
      <EmptyState title={t("llmKeys.emptyTitle")}>
        {t("llmKeys.emptyText")}
      </EmptyState>
    );
  }

  const ids = keys.map((key) => key.id);
  const providerLabels = Object.fromEntries(
    providers.map((provider) => [provider.id, provider.label]),
  );

  return (
    <ol className={styles.list}>
      {keys.map((key, index) => (
        <li key={key.id} className={styles.item}>
          <div className={styles.details}>
            <span className={styles.name}>
              {key.label || providerLabels[key.provider] || key.provider}
              {index === 0 && (
                <span className={styles.badge}>{t("llmKeys.default")}</span>
              )}
            </span>
            <span className={styles.meta}>
              {providerLabels[key.provider] ?? key.provider} · {key.model}
            </span>
          </div>
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              disabled={index === 0}
              onClick={() => onReorder(moveId(ids, index, -1))}
            >
              {t("llmKeys.moveUp")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={index === keys.length - 1}
              onClick={() => onReorder(moveId(ids, index, 1))}
            >
              {t("llmKeys.moveDown")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onRemove(key.id)}>
              {t("llmKeys.remove")}
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}
