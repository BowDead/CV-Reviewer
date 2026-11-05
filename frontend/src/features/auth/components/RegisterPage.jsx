import { useState } from "react";
import { Link, Navigate } from "react-router";
import { Button } from "@/shared/ui/Button";
import { useAuth } from "../hooks/useAuth";
import {
  PASSWORD_MIN_LENGTH,
  REGISTRABLE_ROLES,
  ROLE_LABELS,
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
      setError(new Error("Hasła nie są takie same."));
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
      <h1 className={styles.title}>Załóż konto</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.roles}>
          <legend>Jestem</legend>
          {REGISTRABLE_ROLES.map((role) => (
            <label key={role} className={styles.role}>
              <input
                type="radio"
                name="role"
                value={role}
                checked={form.role === role}
                onChange={handleChange}
              />
              {ROLE_LABELS[role]}
            </label>
          ))}
        </fieldset>

        <label className={styles.field}>
          E-mail
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
          Hasło
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
            Co najmniej {PASSWORD_MIN_LENGTH} znaków.
          </span>
        </label>

        <label className={styles.field}>
          Powtórz hasło
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
          {error && <p className={styles.error}>{error.message}</p>}
        </div>

        <Button type="submit" block disabled={submitting}>
          {submitting ? "Zakładanie konta…" : "Załóż konto"}
        </Button>
      </form>

      <p className={styles.footer}>
        Masz już konto? <Link to="/login">Zaloguj się</Link>
      </p>
    </div>
  );
}
