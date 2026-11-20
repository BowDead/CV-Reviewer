import { useTranslation } from "react-i18next";
import { formatScore } from "@/features/profile";
import { TagList } from "@/shared/ui/TagList";
import styles from "./Candidates.module.scss";

function SkillRow({ label, items, tone }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className={styles.skills}>
      <span className={styles.skillsLabel}>{label}</span>
      <TagList items={items} tone={tone} />
    </div>
  );
}

export function CandidateCard({ candidate, actions }) {
  const { t } = useTranslation();
  const { match } = candidate;
  const meta = [candidate.seniority, candidate.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className={styles.candidate}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.name}>
            {candidate.displayName || t("candidates.anonymous")}
          </span>
          {candidate.headline && (
            <span className={styles.headline}>{candidate.headline}</span>
          )}
          {meta && <span className={styles.meta}>{meta}</span>}
        </div>
        <div className={styles.scores}>
          {match && (
            <span className={styles.score}>
              {match.score}%
              <span className={styles.scoreLabel}>{t("candidates.match")}</span>
            </span>
          )}
          <span className={styles.cvScore}>
            {formatScore(candidate.score)}
            <span className={styles.scoreLabel}>{t("candidates.cvScore")}</span>
          </span>
        </div>
      </div>

      {match ? (
        <>
          <SkillRow
            label={t("candidates.matched")}
            items={match.matched}
            tone="success"
          />
          <SkillRow label={t("candidates.missing")} items={match.missing} />
        </>
      ) : (
        <SkillRow
          label={t("candidates.skills")}
          items={candidate.skills.map((skill) => skill.name)}
        />
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
    </li>
  );
}
