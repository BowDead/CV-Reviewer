import styles from "./CvSummary.module.scss";

const KIND_LABELS = {
  pdf: "PDF",
  docx: "Word (DOCX)",
};

export function CvSummary({ fileName, result, onReset }) {
  const { kind, pageCount, stats, text } = result;

  return (
    <aside className={styles.summary}>
      <h2 className={styles.heading}>Wgrane CV</h2>

      <dl className={styles.stats}>
        <dt>Plik</dt>
        <dd className={styles.fileName}>{fileName}</dd>

        <dt>Format</dt>
        <dd>{KIND_LABELS[kind]}</dd>

        {pageCount !== null && (
          <>
            <dt>Strony</dt>
            <dd>{pageCount}</dd>
          </>
        )}

        <dt>Słowa</dt>
        <dd>{stats.words}</dd>

        <dt>Znaki</dt>
        <dd>{stats.characters}</dd>
      </dl>

      <details className={styles.textDetails}>
        <summary>Tekst wyciągnięty z CV (to przeczyta AI)</summary>
        <pre className={styles.text}>{text}</pre>
      </details>

      <button type="button" className={styles.resetButton} onClick={onReset}>
        Wgraj inny plik
      </button>
    </aside>
  );
}
