import { useTranslation } from "react-i18next";
import { useGithub } from "@/features/github";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { useOfferRepositories } from "../hooks/useOfferRepositories";
import styles from "./Offers.module.scss";

export function OfferRepositories({ offerKey }) {
  const { t } = useTranslation();
  const github = useGithub();
  const enabled = Boolean(github.login);
  const { status, repositories, error } = useOfferRepositories(
    offerKey,
    enabled,
    github.repositories,
  );

  if (!enabled || status === "loading") {
    return null;
  }

  return (
    <div className={styles.repos}>
      <span className={styles.skillsLabel}>
        {t("offers.repositories.label")}
      </span>
      {status === "error" && (
        <span className={styles.reposNote}>{errorMessage(error)}</span>
      )}
      {status === "done" && repositories.length === 0 && (
        <span className={styles.reposNote}>
          {t("offers.repositories.empty")}
        </span>
      )}
      {repositories.length > 0 && (
        <ul className={styles.repoList}>
          {repositories.map((repository) => (
            <li key={repository.id} className={styles.repo}>
              <a
                className={styles.repoName}
                href={repository.url}
                target="_blank"
                rel="noreferrer"
              >
                {repository.name}
              </a>
              <span className={styles.repoSkills}>
                {repository.matchedSkills.join(", ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
