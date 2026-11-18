export function repositoryView(repo) {
  return {
    id: repo.id,
    githubRepoId: repo.githubRepoId,
    name: repo.name,
    description: repo.description,
    url: repo.url,
    languages: repo.languages,
    topics: repo.topics,
    summary: repo.summary,
    skills: repo.skills,
    otherSkills: repo.otherSkills,
    pushedAt: repo.pushedAt,
    status: repo.status,
    analyzedAt: repo.analyzedAt,
  };
}

export function repositoriesView({ login, repositories }) {
  return { login, repositories: repositories.map(repositoryView) };
}
