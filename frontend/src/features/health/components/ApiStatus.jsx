import { useApiHealth } from "../hooks/useApiHealth";
import styles from "./ApiStatus.module.scss";

export function ApiStatus() {
  const { loading, data, error } = useApiHealth();

  if (loading) {
    return <p className={styles.status}>Sprawdzanie połączenia z API…</p>;
  }

  if (error) {
    return (
      <p className={`${styles.status} ${styles.error}`}>
        Brak połączenia z API: {error.message}
      </p>
    );
  }

  return (
    <p className={`${styles.status} ${styles.ok}`}>
      API działa · Groq:{" "}
      {data.groqConfigured ? "skonfigurowany" : "brak klucza"}
    </p>
  );
}
