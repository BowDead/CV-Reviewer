export function savedCvSummaryView(cv) {
  return {
    id: cv.id,
    name: cv.name,
    source: cv.source,
    createdAt: cv.createdAt,
  };
}

export function savedCvView(cv) {
  return {
    ...savedCvSummaryView(cv),
    content: cv.content,
  };
}
