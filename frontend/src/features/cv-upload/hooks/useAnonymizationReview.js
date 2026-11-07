import { useState } from "react";
import {
  composeText,
  countHidden,
  hideEverywhere,
  hideRange,
  prepareSegments,
  toggleSegment,
  withPositions,
} from "../utils/anonymization";

export function useAnonymizationReview(cv) {
  const [review, setReview] = useState({ result: null, segments: [] });

  const result = cv.status === "done" ? cv.result : null;
  const edited = result !== null && review.result === result;
  const segments = edited
    ? review.segments
    : prepareSegments(result?.segments ?? []);

  const update = (change) => setReview({ result, segments: change(segments) });

  return {
    segments: withPositions(segments),
    text: result ? composeText(segments) : null,
    counts: countHidden(segments),
    edited,
    toggle: (index) => update((current) => toggleSegment(current, index)),
    hide: (start, end) => update((current) => hideRange(current, start, end)),
    hideEverywhere: (start, end) =>
      update((current) => hideEverywhere(current, start, end)),
    restore: () => setReview({ result: null, segments: [] }),
  };
}
