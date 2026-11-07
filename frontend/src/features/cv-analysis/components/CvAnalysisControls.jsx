import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import styles from "./CvAnalysisControls.module.scss";

const LABEL_KEYS = {
  idle: "cvAnalysis.analyze",
  loading: "cvAnalysis.analyzing",
  done: "cvAnalysis.analyzeAgain",
  error: "cvAnalysis.retry",
};

export function CvAnalysisControls({ status, disabled = false, onAnalyze }) {
  const { t } = useTranslation();

  return (
    <div className={styles.controls}>
      <Button
        block
        onClick={onAnalyze}
        disabled={disabled || status === "loading"}
      >
        {t(LABEL_KEYS[status] ?? LABEL_KEYS.idle)}
      </Button>
      <p className={styles.hint}>{t("cvAnalysis.privacyHint")}</p>
    </div>
  );
}
