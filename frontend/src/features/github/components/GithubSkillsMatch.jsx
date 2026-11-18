import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/Button";
import { TagList } from "@/shared/ui/TagList";
import { useGithubRepositories } from "../hooks/useGithubRepositories";
import styles from "./Github.module.scss";

function countRepoSkills(repositories) {
  const counts = new Map();
  for (const repository of repositories) {
    for (const skill of repository.skills) {
      counts.set(skill.name, (counts.get(skill.name) ?? 0) + 1);
    }
  }
  return counts;
}

function SkillGroup({ title, items, tone }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div>
      <h4 className={styles.groupTitle}>{title}</h4>
      <TagList items={items} tone={tone} />
    </div>
  );
}

export function GithubSkillsMatch({ cvSkills }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const github = useGithubRepositories();

  if (github.status !== "done") {
    return null;
  }

  const repoSkills = countRepoSkills(github.repositories);
  const goToGithub = (
    <Button size="sm" variant="ghost" onClick={() => navigate("/github")}>
      {t("githubMatch.goToGithub")}
    </Button>
  );

  if (!github.login || repoSkills.size === 0) {
    return (
      <section className={styles.match}>
        <div className={styles.matchHeader}>
          <h3 className={styles.matchTitle}>{t("githubMatch.title")}</h3>
          {goToGithub}
        </div>
        <p className={styles.hint}>
          {github.login
            ? t("githubMatch.noRepos", { login: github.login })
            : t("githubMatch.connect")}
        </p>
      </section>
    );
  }

  const inCv = new Set(cvSkills);
  const confirmed = cvSkills
    .filter((name) => repoSkills.has(name))
    .map((name) =>
      t("githubMatch.inRepos", { name, count: repoSkills.get(name) }),
    );
  const onlyCv = cvSkills.filter((name) => !repoSkills.has(name));
  const onlyGithub = [...repoSkills.keys()].filter((name) => !inCv.has(name));

  return (
    <section className={styles.match}>
      <div className={styles.matchHeader}>
        <h3 className={styles.matchTitle}>{t("githubMatch.title")}</h3>
        {goToGithub}
      </div>
      <SkillGroup
        title={t("githubMatch.confirmed")}
        items={confirmed}
        tone="success"
      />
      <SkillGroup
        title={t("githubMatch.onlyGithub")}
        items={onlyGithub}
        tone="primary"
      />
      <SkillGroup title={t("githubMatch.onlyCv")} items={onlyCv} />
    </section>
  );
}
