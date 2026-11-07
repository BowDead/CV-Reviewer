import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { homePathFor } from "../constants";
import styles from "./AuthForm.module.scss";

export function LoginPage() {
  const { t } = useTranslation();
  const { status, user, login } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (status === "authenticated") {
    return (
      <Navigate to={location.state?.from ?? homePathFor(user.role)} replace />
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          CV
        </span>
        CV Reviewer
      </div>
      <h1 className={styles.title}>{t("auth.login.title")}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          {t("auth.email")}
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label className={styles.field}>
          {t("auth.password")}
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </label>

        <div aria-live="polite">
          {error && <p className={styles.error}>{errorMessage(error)}</p>}
        </div>

        <Button type="submit" block disabled={submitting}>
          {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </form>

      <p className={styles.footer}>
        {t("auth.login.noAccount")}{" "}
        <Link to="/register">{t("auth.login.registerLink")}</Link>
      </p>
    </div>
  );
}
