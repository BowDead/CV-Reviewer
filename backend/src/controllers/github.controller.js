import {
  analyzeRepositories,
  getRepositories,
  removeGithubAccount,
  setGithubAccount,
} from "../services/github.service.js";
import { repositoriesView } from "../views/repository.view.js";

export async function putGithubAccount(req, res) {
  res.json(await setGithubAccount(req.user.id, req.body));
}

export async function deleteGithubAccount(req, res) {
  await removeGithubAccount(req.user.id);
  res.status(204).end();
}

export async function getRepositoryList(req, res) {
  res.json(repositoriesView(await getRepositories(req.user.id)));
}

export async function postRepositoryAnalysis(req, res) {
  const { analyzed, unchanged, failed, remaining, ...list } =
    await analyzeRepositories(req.user.id);
  res.json({
    analyzed,
    unchanged,
    failed,
    remaining,
    ...repositoriesView(list),
  });
}
