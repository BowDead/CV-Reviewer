import { MANUAL_LABEL } from "../constants";

export function prepareSegments(segments) {
  return segments.map((segment) => ({
    ...segment,
    hidden: Boolean(segment.label),
  }));
}

export function withPositions(segments) {
  let position = 0;
  return segments.map((segment) => {
    const start = position;
    position += segment.text.length;
    return { ...segment, start };
  });
}

export function composeText(segments) {
  return segments
    .map((segment) => (segment.hidden ? segment.label : segment.text))
    .join("");
}

export function countHidden(segments) {
  const counts = {};
  for (const { hidden, type } of segments) {
    if (hidden) counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

export function toggleSegment(segments, index) {
  return segments.map((segment, current) =>
    current === index ? { ...segment, hidden: !segment.hidden } : segment,
  );
}

function hideRanges(segments, ranges) {
  const result = [];
  let offset = 0;

  for (const segment of segments) {
    const segmentStart = offset;
    offset += segment.text.length;

    if (segment.label) {
      result.push(segment);
      continue;
    }

    let position = 0;
    for (const range of ranges) {
      const from = Math.max(range.start - segmentStart, position);
      const to = Math.min(range.end - segmentStart, segment.text.length);
      if (from >= to) continue;

      if (from > position) {
        result.push({
          text: segment.text.slice(position, from),
          hidden: false,
        });
      }
      result.push({
        text: segment.text.slice(from, to),
        type: "manual",
        label: MANUAL_LABEL,
        hidden: true,
      });
      position = to;
    }
    if (position < segment.text.length) {
      result.push({ text: segment.text.slice(position), hidden: false });
    }
  }

  return result;
}

export function hideRange(segments, start, end) {
  return hideRanges(segments, [{ start, end }]);
}

export function hideEverywhere(segments, start, end) {
  const text = segments.map((segment) => segment.text).join("");
  const phrase = text.slice(start, end).trim().toLowerCase();
  if (!phrase) return segments;

  const lowerText = text.toLowerCase();
  const ranges = [];
  let found = lowerText.indexOf(phrase);
  while (found !== -1) {
    ranges.push({ start: found, end: found + phrase.length });
    found = lowerText.indexOf(phrase, found + phrase.length);
  }
  return hideRanges(segments, ranges);
}
