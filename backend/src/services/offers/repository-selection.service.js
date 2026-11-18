export const MAX_OFFER_REPOSITORIES = 3;

function pushedTime(repository) {
  return repository.pushedAt ? new Date(repository.pushedAt).getTime() : 0;
}

function scoreRepository(repository, required, niceToHave) {
  const names = repository.skills.map((skill) => skill.name);
  const has = (set) => names.filter((name) => set.has(name.toLowerCase()));
  const matchedRequired = has(required);
  const matchedNiceToHave = has(niceToHave).filter(
    (name) => !matchedRequired.includes(name),
  );
  return {
    repository,
    matchedSkills: [...matchedRequired, ...matchedNiceToHave],
    requiredCount: matchedRequired.length,
  };
}

export function selectRepositories(offer, repositories, limit) {
  const lower = (names) => new Set(names.map((name) => name.toLowerCase()));
  const required = lower(offer.requiredSkills);
  const niceToHave = lower(offer.niceToHaveSkills);

  return repositories
    .filter((repository) => repository.status === "done")
    .map((repository) => scoreRepository(repository, required, niceToHave))
    .filter((entry) => entry.matchedSkills.length > 0)
    .sort(
      (a, b) =>
        b.requiredCount - a.requiredCount ||
        b.matchedSkills.length - a.matchedSkills.length ||
        pushedTime(b.repository) - pushedTime(a.repository),
    )
    .slice(0, limit)
    .map(({ repository, matchedSkills }) => ({
      id: repository.id,
      name: repository.name,
      url: repository.url,
      matchedSkills,
    }));
}
