import { CvAnalysisResult } from "./CvAnalysisResult";
import styles from "./CvAnalysisPanel.module.scss";

export function CvAnalysisPanel({ cvText, analysis }) {
  if (!cvText) {
    return null;
  }

  const isCurrent = analysis.analyzedText === cvText;
  const status = isCurrent ? analysis.status : "idle";

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Analiza AI</h2>
          <p className={styles.description}>
            Ocena treści i struktury CV, sugestie poprawek i dopasowane
            stanowiska. Dane osobowe są usuwane przed wysłaniem tekstu do AI.
          </p>
        </div>
        <button
          type="button"
          className={styles.button}
          onClick={() => analysis.analyze(cvText)}
          disabled={status === "loading"}
        >
          {status === "done" ? "Analizuj ponownie" : "Analizuj CV"}
        </button>
      </div>

      <div aria-live="polite">
        {status === "loading" && (
          <p className={styles.info}>
            AI analizuje CV… Zwykle trwa to 5–20 sekund.
          </p>
        )}
        {status === "error" && (
          <p className={styles.error}>{analysis.error.message}</p>
        )}
      </div>

      {status === "done" && <CvAnalysisResult result={analysis.result} />}
    </div>
  );
}
