import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { useSavedCvs } from "../hooks/useSavedCvs";
import styles from "./Invitations.module.scss";

export function RespondPanel({ onRespond }) {
  const { t } = useTranslation();
  const cvs = useSavedCvs();
  const [cvId, setCvId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function answer(body) {
    setBusy(true);
    setError(null);
    try {
      await onRespond(body);
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  function decline() {
    if (window.confirm(t("invitations.respond.confirmDecline"))) {
      answer({ accept: false });
    }
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.label}>{t("invitations.respond.title")}</h2>
      <p className={styles.hint}>{t("invitations.respond.hint")}</p>

      {cvs === null && (
        <p className={styles.hint}>{t("invitations.respond.loadingCvs")}</p>
      )}
      {cvs?.length === 0 && (
        <p className={styles.hint}>
          {t("invitations.respond.noCvs")}{" "}
          <Link to="/files">{t("invitations.respond.goToFiles")}</Link>
        </p>
      )}
      {cvs?.length > 0 && (
        <label className={styles.field}>
          {t("invitations.respond.cv")}
          <select
            className={styles.input}
            value={cvId}
            disabled={busy}
            onChange={(event) => setCvId(event.target.value)}
          >
            <option value="">{t("invitations.respond.chooseCv")}</option>
            {cvs.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && <p className={styles.error}>{errorMessage(error)}</p>}
      <div className={styles.actions}>
        <Button variant="ghost" size="sm" disabled={busy} onClick={decline}>
          {t("invitations.respond.decline")}
        </Button>
        <Button
          size="sm"
          disabled={!cvId || busy}
          onClick={() => answer({ accept: true, cvId })}
        >
          {t("invitations.respond.accept")}
        </Button>
      </div>
    </section>
  );
}
