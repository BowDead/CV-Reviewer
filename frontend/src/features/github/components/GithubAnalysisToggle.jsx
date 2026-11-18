import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useGithub } from "../hooks/useGithub";
import styles from "./Github.module.scss";

export function GithubAnalysisToggle({ enabled, onChange }) {
  const { t } = useTranslation();
  const github = useGithub();

  if (github.status !== "done") {
    return null;
  }

  if (!github.login) {
    return (
      <div className={styles.source}>
        <strong className={styles.sourceName}>GitHub</strong>
        <Link to="/github" className={styles.sourceLink}>
          {t("githubToggle.connect")}
        </Link>
      </div>
    );
  }

  const analyzed = github.repositories.filter(
    (repository) => repository.status === "done",
  ).length;

  return (
    <label className={`${styles.source} ${styles.clickable}`}>
      <span className={styles.sourceText}>
        <span className={styles.sourceName}>
          <strong>GitHub</strong> · {github.login}
        </span>
        <span className={styles.sourceMeta}>
          {analyzed > 0
            ? t("githubToggle.repos", { count: analyzed })
            : t("githubToggle.noRepos")}
        </span>
      </span>
      <input
        type="checkbox"
        role="switch"
        className={styles.switch}
        checked={enabled && analyzed > 0}
        disabled={analyzed === 0}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={t("githubToggle.label")}
      />
    </label>
  );
}
