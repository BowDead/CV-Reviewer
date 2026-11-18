import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  countPendingRepositories,
  deleteMissingRepositories,
  findGithubLoginEnc,
  listRepositories,
  listRepositoriesToAnalyze,
  listRepositoryStates,
  markRepositoriesFailed,
  saveRepositoryAnalysis,
  updateGithubLogin,
  upsertRepository,
} from "../models/github.model.js";
import {
  decryptBytes,
  decryptJson,
  encryptBytes,
  encryptJson,
} from "../utils/encryption.js";
import { parseInput } from "../utils/parse-input.js";
import { escapeRegExp } from "../utils/regexp.js";
import {
  REPO_ANALYSIS_SYSTEM_PROMPT,
  buildRepoAnalysisUserMessage,
} from "./ai/repo-analysis.prompt.js";
import { repoAnalysisSchema } from "./ai/repo-analysis.schema.js";
import { cleanReadme } from "./github/clean-readme.js";
import {
  fetchGithubUser,
  fetchRepoLanguages,
  fetchRepoReadme,
  fetchUserRepos,
} from "./github/github.client.js";
import { resolveLlm } from "./llm-key.service.js";
import {
  getSkillDetector,
  savePendingSkills,
} from "./skills/skill-dictionary.service.js";
import { getUserDataKey } from "./user-crypto.service.js";

const MAX_REPOS_PER_RUN = 10;
const MAX_DESCRIPTION_CHARS = 300;
const MAX_REPOS_FOR_CV = 10;
const MAX_SUMMARY_CHARS = 200;
const LOGIN_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

const loginSchema = z.object({
  login: z
    .string({ error: "GITHUB_LOGIN_REQUIRED" })
    .trim()
    .transform((value) =>
      value
        .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "")
        .replace(/^@/, "")
        .replace(/\/+$/, ""),
    )
    .pipe(
      z
        .string()
        .min(1, "GITHUB_LOGIN_REQUIRED")
        .regex(LOGIN_PATTERN, "GITHUB_LOGIN_INVALID"),
    ),
});

async function readLogin(userId, dataKey) {
  const loginEnc = await findGithubLoginEnc(userId);
  return loginEnc ? decryptBytes(loginEnc, dataKey).toString("utf8") : null;
}

function readRepository(repository, dataKey) {
  return { ...repository, ...decryptJson(repository.dataEnc, dataKey) };
}

export async function getRepositories(userId) {
  const dataKey = await getUserDataKey(userId);
  const login = await readLogin(userId, dataKey);
  const repositories = await listRepositories(userId);
  return {
    login,
    repositories: repositories.map((repo) => readRepository(repo, dataKey)),
  };
}

export async function getRepositoriesForCv(userId) {
  const { login, repositories } = await getRepositories(userId);
  if (!login) {
    return [];
  }
  return repositories
    .filter((repo) => repo.status === "done")
    .slice(0, MAX_REPOS_FOR_CV)
    .map((repo) => ({
      name: hideLogin(repo.name, login),
      summary: hideLogin(
        (repo.summary ?? "").slice(0, MAX_SUMMARY_CHARS),
        login,
      ),
      skills: repo.skills.map((skill) => skill.name),
    }));
}

export async function setGithubAccount(userId, input) {
  const { login } = parseInput(loginSchema, input);
  const githubUser = await fetchGithubUser(login);

  const dataKey = await getUserDataKey(userId);
  const current = await readLogin(userId, dataKey);
  const changed = current?.toLowerCase() !== githubUser.login.toLowerCase();

  await updateGithubLogin(
    userId,
    encryptBytes(Buffer.from(githubUser.login, "utf8"), dataKey),
    changed,
  );
  return { login: githubUser.login };
}

export async function removeGithubAccount(userId) {
  await updateGithubLogin(userId, null, true);
}

function basicData(repo) {
  return {
    name: repo.name,
    description: repo.description,
    url: repo.html_url,
    topics: repo.topics ?? [],
    languages: {},
    summary: null,
    otherSkills: [],
  };
}

async function syncRepositories(userId, githubRepos, dataKey) {
  const states = await listRepositoryStates(userId);
  const known = new Map(states.map((state) => [state.githubRepoId, state]));

  let unchanged = 0;
  for (const repo of githubRepos) {
    const state = known.get(repo.id);
    const pushedAt = new Date(repo.pushed_at);
    if (state && state.pushedAt?.getTime() === pushedAt.getTime()) {
      if (state.status === "done") {
        unchanged += 1;
      }
      continue;
    }
    await upsertRepository({
      userId,
      githubRepoId: repo.id,
      dataEnc: encryptJson(basicData(repo), dataKey),
      pushedAt,
    });
  }

  await deleteMissingRepositories(
    userId,
    githubRepos.map((repo) => repo.id),
  );
  return unchanged;
}

function detectRepoSkills(detector, languages, topics) {
  const found = new Map();
  for (const language of Object.keys(languages)) {
    const skill = detector.findByLanguage(language);
    if (skill) {
      found.set(skill.id, skill);
    }
  }
  for (const topic of topics) {
    const skill =
      detector.find(topic) ?? detector.find(topic.replaceAll("-", " "));
    if (skill) {
      found.set(skill.id, skill);
    }
  }
  return [...found.values()];
}

function languageShares(languages) {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  if (total === 0) {
    return [];
  }
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => `${name} ${Math.round((bytes / total) * 100)}%`);
}

function hideLogin(text, login) {
  return text.replace(new RegExp(escapeRegExp(login), "gi"), "[LOGIN]");
}

function toPromptItem(item, login) {
  return {
    id: item.key,
    name: hideLogin(item.data.name, login),
    description: hideLogin(
      (item.data.description ?? "").slice(0, MAX_DESCRIPTION_CHARS),
      login,
    ),
    languages: languageShares(item.data.languages),
    topics: item.data.topics,
    detected: item.detected.map((skill) => skill.name),
    readme: hideLogin(item.readme, login),
  };
}

function mergeRepoSkills(detected, review, detector) {
  const rejected = new Set(
    review.falsePositives.map((name) => name.toLowerCase()),
  );
  const skills = new Map();
  for (const skill of detected) {
    if (!rejected.has(skill.name.toLowerCase())) {
      skills.set(skill.id, { skillId: skill.id, source: "system" });
    }
  }

  const other = [];
  for (const name of review.additional) {
    const skill = detector.find(name);
    if (skill) {
      if (!skills.has(skill.id)) {
        skills.set(skill.id, { skillId: skill.id, source: "llm" });
      }
    } else if (
      !other.some((item) => item.toLowerCase() === name.toLowerCase())
    ) {
      other.push(name);
    }
  }
  return { skills: [...skills.values()], other };
}

async function fetchDetails(login, row, index, detector, dataKey) {
  const data = decryptJson(row.dataEnc, dataKey);
  try {
    const [languages, readme] = await Promise.all([
      fetchRepoLanguages(login, data.name),
      fetchRepoReadme(login, data.name),
    ]);
    return {
      key: `r${index + 1}`,
      row,
      data: { ...data, languages },
      readme: cleanReadme(readme),
      detected: detectRepoSkills(detector, languages, data.topics),
    };
  } catch (err) {
    console.error(`Nie udało się pobrać repozytorium ${data.name}:`, err.code);
    return null;
  }
}

async function analyzeBatch({ login, llm, batch, dataKey }) {
  const detector = await getSkillDetector();
  const fetched = await Promise.all(
    batch.map((row, index) =>
      fetchDetails(login, row, index, detector, dataKey),
    ),
  );
  const ready = fetched.filter(Boolean);
  const failedIds = batch
    .filter((row) => !ready.some((item) => item.row.id === row.id))
    .map((row) => row.id);

  if (ready.length > 0) {
    let reviews;
    try {
      const raw = await llm.completeJson({
        system: REPO_ANALYSIS_SYSTEM_PROMPT,
        user: buildRepoAnalysisUserMessage(
          ready.map((item) => toPromptItem(item, login)),
        ),
      });
      reviews = repoAnalysisSchema.parse(raw).repositories;
    } catch (err) {
      await markRepositoriesFailed(batch.map((row) => row.id));
      throw err;
    }

    const unknown = [];
    for (const item of ready) {
      const review = reviews.find((entry) => entry.id === item.key) ?? {
        summary: "",
        falsePositives: [],
        additional: [],
      };
      const { skills, other } = mergeRepoSkills(
        item.detected,
        review,
        detector,
      );
      unknown.push(...other);
      const data = {
        ...item.data,
        summary: review.summary || null,
        otherSkills: other,
      };
      await saveRepositoryAnalysis(
        item.row.id,
        encryptJson(data, dataKey),
        skills,
      );
    }
    await savePendingSkills(unknown);
  }

  if (failedIds.length > 0) {
    await markRepositoriesFailed(failedIds);
  }
  return { analyzed: ready.length, failed: failedIds.length };
}

export async function analyzeRepositories(userId) {
  const dataKey = await getUserDataKey(userId);
  const login = await readLogin(userId, dataKey);
  if (!login) {
    throw new HttpError(409, "GITHUB_ACCOUNT_REQUIRED");
  }
  const llm = await resolveLlm(userId);

  const githubRepos = (await fetchUserRepos(login)).filter(
    (repo) => !repo.fork && repo.size > 0,
  );
  const unchanged = await syncRepositories(userId, githubRepos, dataKey);

  const batch = await listRepositoriesToAnalyze(userId, MAX_REPOS_PER_RUN);
  const { analyzed, failed } =
    batch.length > 0
      ? await analyzeBatch({ login, llm, batch, dataKey })
      : { analyzed: 0, failed: 0 };

  return {
    analyzed,
    unchanged,
    failed,
    remaining: await countPendingRepositories(userId),
    ...(await getRepositories(userId)),
  };
}
