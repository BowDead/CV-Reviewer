import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useGithubRepositories } from "../hooks/useGithubRepositories";
import { GithubLoginForm } from "./GithubLoginForm";
import { RepositoryList } from "./RepositoryList";
import styles from "./Github.module.scss";

export function GithubPanel() {
  const { t } = useTranslation();
  const {
    status,
    login,
    repositories,
    error,
    analyzing,
    lastRun,
    actionError,
    saveLogin,
    removeAccount,
    analyze,
  } = useGithubRepositories();
  const [editing, setEditing] = useState(false);

  if (status === "loading") {
    return <EmptyState busy title={t("github.loading")} />;
  }

  if (status === "error") {
    return (
      <EmptyState tone="error" title={t("github.loadFailed")}>
        {errorMessage(error)}
      </EmptyState>
    );
  }

  if (!login || editing) {
    return (
      <div className={styles.panel}>
        <GithubLoginForm
          initialLogin={login ?? ""}
          onSave={async (value) => {
            await saveLogin(value);
            setEditing(false);
          }}
          onCancel={login ? () => setEditing(false) : null}
        />
      </div>
    );
  }

  function handleRemove() {
    if (window.confirm(t("github.confirmRemove", { login }))) {
      removeAccount();
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.account}>
        <span className={styles.accountName}>
          {t("github.connected")}{" "}
          <a
            href={`https://github.com/${login}`}
            target="_blank"
            rel="noreferrer"
          >
            {login}
          </a>
        </span>
        <div className={styles.buttons}>
          <Button size="sm" disabled={analyzing} onClick={analyze}>
            {analyzing ? t("github.analyzing") : t("github.analyze")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={analyzing}
            onClick={() => setEditing(true)}
          >
            {t("github.change")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={analyzing}
            onClick={handleRemove}
          >
            {t("github.remove")}
          </Button>
        </div>
      </div>

      <div aria-live="polite">
        {analyzing && (
          <p className={styles.info}>{t("github.analyzingHint")}</p>
        )}
        {lastRun && !analyzing && (
          <p className={styles.info}>
            {t("github.lastRun", lastRun)}
            {lastRun.remaining > 0 &&
              ` ${t("github.remaining", { left: lastRun.remaining })}`}
          </p>
        )}
        {actionError && (
          <p className={styles.error}>{errorMessage(actionError)}</p>
        )}
      </div>

      <RepositoryList repositories={repositories} />
    </div>
  );
}
