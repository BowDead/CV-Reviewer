import { useTranslation } from "react-i18next";
import { TagList } from "@/shared/ui/TagList";
import styles from "./ProfileSummary.module.scss";

function formatPeriod(start, end) {
  return [start, end].filter(Boolean).join(" – ");
}

export function ProfileSummary({ profile }) {
  const { t } = useTranslation();
  const {
    headline,
    location,
    experience,
    education,
    skills,
    languages,
    certifications,
  } = profile;

  return (
    <section className={styles.profile}>
      <div className={styles.body}>
        {(headline || location) && (
          <p className={styles.headline}>
            {[headline, location].filter(Boolean).join(" · ")}
          </p>
        )}

        {experience.length > 0 && (
          <div>
            <h4 className={styles.heading}>
              {t("cvAnalysis.profile.experience")}
            </h4>
            <ul className={styles.entries}>
              {experience.map((job, index) => (
                <li key={index}>
                  <strong>{job.title}</strong>
                  {job.company && ` · ${job.company}`}
                  <span className={styles.period}>
                    {formatPeriod(job.start, job.end)}
                  </span>
                  {job.highlights.length > 0 && (
                    <ul className={styles.highlights}>
                      {job.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h4 className={styles.heading}>
              {t("cvAnalysis.profile.education")}
            </h4>
            <ul className={styles.entries}>
              {education.map((item, index) => (
                <li key={index}>
                  <strong>{item.degree}</strong>
                  {item.school && ` · ${item.school}`}
                  <span className={styles.period}>
                    {formatPeriod(item.start, item.end)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h4 className={styles.heading}>{t("cvAnalysis.profile.skills")}</h4>
            {skills.map((group) => (
              <div key={group.category} className={styles.skillGroup}>
                <span className={styles.groupName}>{group.category}</span>
                <TagList items={group.items} />
              </div>
            ))}
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h4 className={styles.heading}>
              {t("cvAnalysis.profile.languages")}
            </h4>
            <TagList
              items={languages.map((lang) =>
                lang.level ? `${lang.name} (${lang.level})` : lang.name,
              )}
            />
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h4 className={styles.heading}>
              {t("cvAnalysis.profile.certifications")}
            </h4>
            <TagList items={certifications} />
          </div>
        )}
      </div>
    </section>
  );
}
