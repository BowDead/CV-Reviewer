import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CvPreview } from "@/features/cv-upload";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { useCvCreator } from "../hooks/useCvCreator";
import {
  LANGUAGE_LEVELS,
  LIMITS,
  createJob,
  createLanguage,
  createSchool,
} from "../utils/creatorForm";
import { CreatorEntries } from "./CreatorEntries";
import { CreatorSkills } from "./CreatorSkills";
import styles from "./CvCreator.module.scss";

function paneClass(base, visible) {
  return visible ? base : `${base} ${styles.hidden}`;
}

export function CvCreator({ onSaved }) {
  const { t } = useTranslation();
  const creator = useCvCreator();
  const [view, setView] = useState("form");
  const { form, update } = creator;
  const busy = creator.saving;

  function field(name) {
    return (event) => update({ [name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const saved = await creator.save();
    if (saved) onSaved(saved);
  }

  const jobFields = [
    {
      name: "title",
      label: t("cvCreator.experience.position"),
      maxLength: 150,
    },
    {
      name: "company",
      label: t("cvCreator.experience.company"),
      maxLength: 150,
    },
    { name: "start", label: t("cvCreator.from"), maxLength: 30 },
    { name: "end", label: t("cvCreator.to"), maxLength: 30 },
    {
      name: "highlights",
      label: t("cvCreator.experience.highlights"),
      type: "textarea",
      wide: true,
    },
  ];
  const schoolFields = [
    {
      name: "degree",
      label: t("cvCreator.education.degree"),
      maxLength: 150,
    },
    {
      name: "school",
      label: t("cvCreator.education.school"),
      maxLength: 150,
    },
    { name: "start", label: t("cvCreator.from"), maxLength: 30 },
    { name: "end", label: t("cvCreator.to"), maxLength: 30 },
  ];
  const languageFields = [
    { name: "name", label: t("cvCreator.languages.name"), maxLength: 50 },
    {
      name: "level",
      label: t("cvCreator.languages.level"),
      type: "select",
      options: [...LANGUAGE_LEVELS, t("cvCreator.languages.native")],
    },
  ];

  return (
    <div className={styles.creator}>
      <p className={styles.intro}>{t("cvCreator.intro")}</p>

      <div
        className={styles.views}
        role="tablist"
        aria-label={t("cvCreator.viewLabel")}
      >
        {["form", "preview"].map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={view === name}
            className={view === name ? styles.viewActive : styles.view}
            onClick={() => setView(name)}
          >
            {t(`cvCreator.views.${name}`)}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        <form
          className={paneClass(styles.form, view === "form")}
          onSubmit={handleSubmit}
        >
          <section className={styles.card}>
            <h2 className={styles.label}>{t("cvCreator.contact.title")}</h2>
            <div className={styles.grid}>
              <label className={styles.field}>
                {t("cvCreator.contact.fullName")}
                <input
                  className={styles.input}
                  value={form.fullName}
                  maxLength={150}
                  disabled={busy}
                  onChange={field("fullName")}
                />
              </label>
              <label className={styles.field}>
                {t("cvCreator.contact.headline")}
                <input
                  className={styles.input}
                  value={form.headline}
                  maxLength={150}
                  required
                  disabled={busy}
                  placeholder={t("cvCreator.contact.headlinePlaceholder")}
                  onChange={field("headline")}
                />
              </label>
              <label className={styles.field}>
                {t("cvCreator.contact.email")}
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  maxLength={254}
                  disabled={busy}
                  onChange={field("email")}
                />
              </label>
              <label className={styles.field}>
                {t("cvCreator.contact.phone")}
                <input
                  className={styles.input}
                  type="tel"
                  value={form.phone}
                  maxLength={40}
                  disabled={busy}
                  onChange={field("phone")}
                />
              </label>
            </div>
            <p className={styles.hint}>{t("cvCreator.contact.hint")}</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.label}>{t("cvCreator.summary.title")}</h2>
            <label className={styles.field}>
              {t("cvCreator.summary.label")}
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                rows={4}
                value={form.summary}
                maxLength={2000}
                disabled={busy}
                onChange={field("summary")}
              />
            </label>
          </section>

          <CreatorEntries
            title={t("cvCreator.experience.title")}
            addLabel={t("cvCreator.experience.add")}
            items={form.experience}
            fields={jobFields}
            max={LIMITS.experience}
            disabled={busy}
            createItem={createJob}
            onChange={(experience) => update({ experience })}
          />

          <CreatorEntries
            title={t("cvCreator.education.title")}
            addLabel={t("cvCreator.education.add")}
            items={form.education}
            fields={schoolFields}
            max={LIMITS.education}
            disabled={busy}
            createItem={createSchool}
            onChange={(education) => update({ education })}
          />

          <CreatorSkills
            skills={form.skills}
            disabled={busy}
            onChange={(skills) => update({ skills })}
          />

          <CreatorEntries
            title={t("cvCreator.languages.title")}
            addLabel={t("cvCreator.languages.add")}
            items={form.languages}
            fields={languageFields}
            max={LIMITS.languages}
            disabled={busy}
            createItem={createLanguage}
            onChange={(languages) => update({ languages })}
          />

          <div className={styles.saveBar}>
            <label className={styles.field}>
              {t("cvCreator.name")}
              <input
                className={styles.input}
                value={form.name}
                maxLength={255}
                required
                disabled={busy}
                placeholder={t("cvCreator.namePlaceholder")}
                onChange={field("name")}
              />
            </label>
            <Button type="submit" disabled={busy}>
              {creator.saving ? t("cvCreator.saving") : t("cvCreator.save")}
            </Button>
          </div>
          {creator.error && (
            <p className={styles.error}>{errorMessage(creator.error)}</p>
          )}
        </form>

        <aside
          className={paneClass(styles.preview, view === "preview")}
          aria-label={t("cvCreator.views.preview")}
        >
          <h2 className={styles.label}>{t("cvCreator.views.preview")}</h2>
          {creator.preview ? (
            <CvPreview kind="saved" text={creator.preview} />
          ) : (
            <p className={styles.placeholder}>{t("cvCreator.previewEmpty")}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
