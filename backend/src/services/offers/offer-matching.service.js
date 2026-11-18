const NICE_TO_HAVE_BONUS = 0.1;

export function matchOffer(offer, userSkills) {
  const has = (name) => userSkills.has(name.toLowerCase());
  const required = offer.requiredSkills;
  const niceToHave = offer.niceToHaveSkills;

  const matchedRequired = required.filter(has);
  const matchedNiceToHave = niceToHave.filter(has);

  const base = required.length ? matchedRequired.length / required.length : 0;
  const bonus = niceToHave.length
    ? (matchedNiceToHave.length / niceToHave.length) * NICE_TO_HAVE_BONUS
    : 0;

  return {
    score: Math.min(100, Math.round((base + bonus) * 100)),
    matched: [...matchedRequired, ...matchedNiceToHave],
    missing: required.filter((name) => !has(name)),
  };
}

export function rankOffers(offers, userSkills, limit) {
  return offers
    .map((offer) => ({ ...offer, match: matchOffer(offer, userSkills) }))
    .filter((offer) => offer.match.score > 0)
    .sort(
      (a, b) =>
        b.match.score - a.match.score ||
        String(b.updatedAt).localeCompare(String(a.updatedAt)),
    )
    .slice(0, limit);
}
