import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import styles from "./CvAnonymizedText.module.scss";

function describeHidden(counts, t) {
  return Object.entries(counts)
    .map(
      ([type, count]) =>
        `${t(`cvUpload.anonymized.labels.${type}`, { defaultValue: type })} (${count})`,
    )
    .join(", ");
}

function readSelection(container) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const position = (node, offset) => {
    const span = node.parentElement?.closest("[data-start]");
    if (!span || !container.contains(span)) return null;
    return Number(span.dataset.start) + offset;
  };

  const start = position(range.startContainer, range.startOffset);
  const end = position(range.endContainer, range.endOffset);
  return start !== null && end !== null && start < end ? { start, end } : null;
}

export function CvAnonymizedText({ review, changedAfterAnalysis }) {
  const { t } = useTranslation();
  const textRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const hidden = describeHidden(review.counts, t);

  function updateSelection() {
    setSelection(readSelection(textRef.current));
  }

  function hideSelection(everywhere) {
    if (everywhere) {
      review.hideEverywhere(selection.start, selection.end);
    } else {
      review.hide(selection.start, selection.end);
    }
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t("cvUpload.anonymized.title")}</h3>
        {review.edited && (
          <Button variant="ghost" size="sm" onClick={review.restore}>
            {t("cvUpload.anonymized.restore")}
          </Button>
        )}
      </div>
      <p className={styles.description}>
        {t("cvUpload.anonymized.description")}
      </p>
      <p className={styles.summary}>
        {hidden
          ? t("cvUpload.anonymized.hidden", { list: hidden })
          : t("cvUpload.anonymized.noneFound")}
      </p>
      {changedAfterAnalysis && (
        <p className={styles.note}>
          {t("cvUpload.anonymized.changedAfterAnalysis")}
        </p>
      )}

      <div className={styles.toolbar}>
        <Button
          size="sm"
          disabled={!selection}
          onClick={() => hideSelection(false)}
        >
          {t("cvUpload.anonymized.hideSelection")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!selection}
          onClick={() => hideSelection(true)}
        >
          {t("cvUpload.anonymized.hideEverywhere")}
        </Button>
      </div>

      <div
        ref={textRef}
        className={styles.text}
        onMouseUp={updateSelection}
        onKeyUp={updateSelection}
      >
        {review.segments.map((segment, index) =>
          segment.label ? (
            <button
              key={segment.start}
              type="button"
              className={segment.hidden ? styles.hidden : styles.revealed}
              title={segment.hidden ? segment.text : segment.label}
              aria-pressed={segment.hidden}
              onClick={() => review.toggle(index)}
            >
              {segment.hidden ? segment.label : segment.text}
            </button>
          ) : (
            <span key={segment.start} data-start={segment.start}>
              {segment.text}
            </span>
          ),
        )}
      </div>
    </section>
  );
}
