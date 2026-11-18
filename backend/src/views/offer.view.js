export function offerView(offer) {
  return {
    offerKey: offer.offerKey,
    title: offer.title,
    company: offer.company,
    location: offer.location,
    url: offer.url,
    updatedAt: offer.updatedAt,
    requiredSkills: offer.requiredSkills,
    niceToHaveSkills: offer.niceToHaveSkills,
    match: offer.match,
    insight: offer.insight
      ? offerInsightView({ ...offer.insight, cached: true })
      : null,
  };
}

export function offerInsightView(insight) {
  return {
    comment: insight.comment,
    createdAt: insight.createdAt,
    cached: insight.cached,
  };
}
