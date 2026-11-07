import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate } from "react-router";
import { errorMessage } from "@/shared/i18n/errorMessage";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "../hooks/useAuth";
import {
  PASSWORD_MIN_LENGTH,
  REGISTRABLE_ROLES,
  homePathFor,
} from "../constants";
import styles from "./AuthForm.module.scss";

const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
  role: "candidate",
};

export function RegisterPage() {
  const { t } = useTranslation();
  const { status, user, register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (status === "authenticated") {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError({ code: "PASSWORDS_MISMATCH" });
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await register({
        email: form.email,
        password: form.password,
        role: form.role,
      });
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
      <h1 className={styles.title}>{t("auth.register.title")}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.roles}>
          <legend>{t("auth.register.roleLegend")}</legend>
          {REGISTRABLE_ROLES.map((role) => (
            <label key={role} className={styles.role}>
              <input
                type="radio"
                name="role"
                value={role}
                checked={form.role === role}
                onChange={handleChange}
              />
              {t(`roles.${role}`)}
            </label>
          ))}
        </fieldset>

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
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={form.password}
            onChange={handleChange}
          />
          <span className={styles.hint}>
            {t("auth.register.passwordHint", { min: PASSWORD_MIN_LENGTH })}
          </span>
        </label>

        <label className={styles.field}>
          {t("auth.register.confirmPassword")}
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </label>

        <div aria-live="polite">
          {error && <p className={styles.error}>{errorMessage(error)}</p>}
        </div>

        <Button type="submit" block disabled={submitting}>
          {submitting
            ? t("auth.register.submitting")
            : t("auth.register.submit")}
        </Button>
      </form>

      <p className={styles.footer}>
        {t("auth.register.hasAccount")}{" "}
        <Link to="/login">{t("auth.register.loginLink")}</Link>
      </p>
    </div>
  );
}
