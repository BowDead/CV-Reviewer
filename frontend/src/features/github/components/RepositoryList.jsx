import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { EmptyState } from "@/shared/ui/EmptyState";
import { TagList } from "@/shared/ui/TagList";
import styles from "./Github.module.scss";

function languageShares(languages) {
  const entries = Object.entries(languages ?? {});
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total === 0) {
    return "";
  }
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, bytes]) => `${name} ${Math.round((bytes / total) * 100)}%`)
    .join(" · ");
}

function RepositoryStatus({ repository }) {
  const { t } = useTranslation();

  if (repository.status === "done") {
    return (
      <span className={styles.meta}>
        {t("github.analyzedAt", {
          date: formatDateTime(repository.analyzedAt),
        })}
      </span>
    );
  }

  return (
    <span className={`${styles.status} ${styles[repository.status]}`}>
      {t(`github.status.${repository.status}`)}
    </span>
  );
}

export function RepositoryList({ repositories }) {
  const { t } = useTranslation();

  if (!repositories.length) {
    return (
      <EmptyState title={t("github.emptyTitle")}>
        {t("github.emptyText")}
      </EmptyState>
    );
  }

  return (
    <ul className={styles.list}>
      {repositories.map((repository) => (
        <li key={repository.id} className={styles.repo}>
          <div className={styles.repoHeader}>
            <a
              className={styles.repoName}
              href={repository.url}
              target="_blank"
              rel="noreferrer"
            >
              {repository.name}
            </a>
            <RepositoryStatus repository={repository} />
          </div>

          {(repository.summary || repository.description) && (
            <p className={styles.summary}>
              {repository.summary || repository.description}
            </p>
          )}

          {languageShares(repository.languages) && (
            <span className={styles.meta}>
              {languageShares(repository.languages)}
            </span>
          )}

          <TagList
            tone="primary"
            items={repository.skills.map((skill) => skill.name)}
          />
          <TagList items={repository.otherSkills} />
        </li>
      ))}
    </ul>
  );
}
