import { TagList } from "@/shared/ui/TagList";
import styles from "./ProfileSummary.module.scss";

function formatPeriod(start, end) {
  return [start, end].filter(Boolean).join(" – ");
}

export function ProfileSummary({ profile }) {
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
            <h4 className={styles.heading}>Doświadczenie</h4>
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
            <h4 className={styles.heading}>Wykształcenie</h4>
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
            <h4 className={styles.heading}>Umiejętności</h4>
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
            <h4 className={styles.heading}>Języki</h4>
            <TagList
              items={languages.map((lang) =>
                lang.level ? `${lang.name} (${lang.level})` : lang.name,
              )}
            />
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h4 className={styles.heading}>Certyfikaty</h4>
            <TagList items={certifications} />
          </div>
        )}
      </div>
    </section>
  );
}
