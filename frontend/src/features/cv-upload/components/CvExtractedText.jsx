import styles from "./CvExtractedText.module.scss";

export function CvExtractedText({ text }) {
  return (
    <section className={styles.card}>
      <h3 className={styles.title}>Tekst wyciągnięty z CV</h3>
      <p className={styles.description}>
        Na tej podstawie działa analiza. Dane osobowe są usuwane przed wysłaniem
        do AI.
      </p>
      <pre className={styles.text}>{text}</pre>
    </section>
  );
}
