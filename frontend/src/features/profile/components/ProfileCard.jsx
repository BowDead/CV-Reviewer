import { useTranslation } from "react-i18next";
import { formatScore } from "./formatScore";
import styles from "./Profile.module.scss";

export function ProfileCard({ profile, saving, onPublishChange }) {
  const { t } = useTranslation();
  const meta = [profile.seniority, profile.location]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <div className={styles.identity}>
          <p className={styles.name}>
            {profile.displayName || t("candidateProfile.anonymous")}
          </p>
          {profile.headline && (
            <p className={styles.headline}>{profile.headline}</p>
          )}
          {meta && <span className={styles.meta}>{meta}</span>}
        </div>
        <div className={styles.score}>
          {formatScore(profile.score)}
          <span className={styles.scoreLabel}>
            {t("candidateProfile.score")}
          </span>
        </div>
      </div>

      <label className={styles.switchRow}>
        <input
          type="checkbox"
          role="switch"
          className={styles.switch}
          checked={profile.isPublished}
          disabled={saving}
          onChange={(event) => onPublishChange(event.target.checked)}
        />
        {t("candidateProfile.visible")}
      </label>
      <p className={styles.hint}>{t("candidateProfile.visibleHint")}</p>
    </section>
  );
}
