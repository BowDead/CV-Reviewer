export function parsedCvView(parsedCv) {
  return {
    kind: parsedCv.kind,
    text: parsedCv.text,
    pageCount: parsedCv.pageCount,
    stats: {
      characters: parsedCv.stats.characters,
      words: parsedCv.stats.words,
    },
  };
}

export function anonymizedCvView(segments) {
  return {
    segments: segments.map(({ text, type, label }) =>
      label ? { text, type, label } : { text },
    ),
  };
}
