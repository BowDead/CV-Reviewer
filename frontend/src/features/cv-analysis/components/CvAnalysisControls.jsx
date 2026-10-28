import { Button } from "@/shared/ui/Button";
import styles from "./CvAnalysisControls.module.scss";

const LABELS = {
  idle: "Analizuj CV",
  loading: "Analizowanie…",
  done: "Analizuj ponownie",
  error: "Spróbuj ponownie",
};

export function CvAnalysisControls({ status, disabled = false, onAnalyze }) {
  return (
    <div className={styles.controls}>
      <Button
        block
        onClick={onAnalyze}
        disabled={disabled || status === "loading"}
      >
        {LABELS[status] ?? LABELS.idle}
      </Button>
      <p className={styles.hint}>
        Dane osobowe są usuwane przed wysłaniem tekstu do AI.
      </p>
    </div>
  );
}
