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
