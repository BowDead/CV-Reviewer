import { env } from "../../config/env.js";
import { HttpError } from "../../errors/HttpError.js";

const API_URL = "https://api.github.com";
const TIMEOUT_MS = 15_000;
const JSON_TYPE = "application/vnd.github+json";
const RAW_TYPE = "application/vnd.github.raw+json";

function buildHeaders(accept) {
  const headers = {
    Accept: accept,
    "User-Agent": "CV-Reviewer",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (env.githubToken) {
    headers.Authorization = `Bearer ${env.githubToken}`;
  }
  return headers;
}

function minutesUntilReset(response) {
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  if (!reset) {
    return 60;
  }
  return Math.max(1, Math.ceil((reset * 1000 - Date.now()) / 60_000));
}

async function githubFetch(path, accept = JSON_TYPE) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: buildHeaders(accept),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      throw new HttpError(504, "GITHUB_TIMEOUT");
    }
    throw new HttpError(502, "GITHUB_CONNECTION");
  }

  if (response.status === 404) {
    return null;
  }
  const limited =
    (response.status === 403 || response.status === 429) &&
    response.headers.get("x-ratelimit-remaining") === "0";
  if (limited) {
    throw new HttpError(429, "GITHUB_RATE_LIMIT", {
      minutes: minutesUntilReset(response),
    });
  }
  if (!response.ok) {
    console.error("Błąd GitHub API:", response.status, path);
    throw new HttpError(502, "GITHUB_ERROR");
  }
  return response;
}

function userPath(login) {
  return `/users/${encodeURIComponent(login)}`;
}

function repoPath(login, name) {
  return `/repos/${encodeURIComponent(login)}/${encodeURIComponent(name)}`;
}

export async function fetchGithubUser(login) {
  const response = await githubFetch(userPath(login));
  if (!response) {
    throw new HttpError(404, "GITHUB_USER_NOT_FOUND", { login });
  }
  return response.json();
}

export async function fetchUserRepos(login) {
  const response = await githubFetch(
    `${userPath(login)}/repos?type=owner&sort=pushed&per_page=100`,
  );
  if (!response) {
    throw new HttpError(404, "GITHUB_USER_NOT_FOUND", { login });
  }
  return response.json();
}

export async function fetchRepoLanguages(login, name) {
  const response = await githubFetch(`${repoPath(login, name)}/languages`);
  return response ? response.json() : {};
}

export async function fetchRepoReadme(login, name) {
  const response = await githubFetch(
    `${repoPath(login, name)}/readme`,
    RAW_TYPE,
  );
  return response ? response.text() : "";
}
