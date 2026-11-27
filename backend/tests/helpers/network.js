import { vi } from "vitest";

const GROQ = "api.groq.com";
const SOLID_JOBS = "solid.jobs";
const GITHUB = "api.github.com";

function stubFetch(answers) {
  const requests = [];
  vi.stubGlobal("fetch", async (input, init = {}) => {
    const url = new URL(input);
    const answer = answers[url.hostname];
    if (!answer) {
      throw new Error(`Niedozwolone połączenie: ${url.hostname}`);
    }
    const request = {
      host: url.hostname,
      path: url.pathname,
      headers: new Headers(init.headers),
      body: init.body ? JSON.parse(init.body) : null,
    };
    requests.push(request);
    return answer(request);
  });
  return requests;
}

function groqAnswers(contents) {
  let number = 0;
  return () => {
    const content = contents[Math.min(number, contents.length - 1)] ?? {};
    number += 1;
    const text =
      typeof content === "string" ? content : JSON.stringify(content);
    return Response.json({ choices: [{ message: { content: text } }] });
  };
}

function githubAnswers(login, repositories) {
  return ({ path }) => {
    if (path === `/users/${login}`) {
      return Response.json({ login });
    }
    if (path === `/users/${login}/repos`) {
      return Response.json(repositories.map(({ details }) => details));
    }
    const repository = repositories.find(({ details }) =>
      path.startsWith(`/repos/${login}/${details.name}/`),
    );
    if (repository && path.endsWith("/languages")) {
      return Response.json(repository.languages);
    }
    if (repository && path.endsWith("/readme")) {
      return new Response(repository.readme);
    }
    return new Response("", { status: 404 });
  };
}

export function blockNetwork() {
  stubFetch({});
}

export function stubGroq(...contents) {
  return stubFetch({ [GROQ]: groqAnswers(contents) });
}

export function stubGroqError(status) {
  return stubFetch({
    [GROQ]: () => Response.json({ error: { message: "błąd" } }, { status }),
  });
}

export function stubSolidJobs(jobs) {
  return stubFetch({
    [SOLID_JOBS]: () => Response.json({ totalPages: 1, jobs }),
  });
}

export function stubSolidJobsError(status) {
  return stubFetch({ [SOLID_JOBS]: () => new Response("", { status }) });
}

export function stubGithub(login, repositories, modelAnswer) {
  return stubFetch({
    [GITHUB]: githubAnswers(login, repositories),
    [GROQ]: groqAnswers([modelAnswer]),
  });
}

export function stubGithubLimit(resetAt) {
  return stubFetch({
    [GITHUB]: () =>
      new Response("", {
        status: 403,
        headers: {
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": String(Math.ceil(resetAt / 1000)),
        },
      }),
  });
}
