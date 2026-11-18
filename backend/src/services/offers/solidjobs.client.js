import { HttpError } from "../../errors/HttpError.js";

const API_URL = "https://solid.jobs/public-api/offers/IT";
const CAMPAIGN = "cv-reviewer";
const PAGE_SIZE = 100;
const MAX_PAGES = 15;
const TIMEOUT_MS = 15_000;

async function fetchPage(pageIndex) {
  const url = new URL(API_URL);
  url.searchParams.set("campaign", CAMPAIGN);
  url.searchParams.set("pageIndex", String(pageIndex));
  url.searchParams.set("pageSize", String(PAGE_SIZE));

  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      throw new HttpError(504, "SOLIDJOBS_TIMEOUT");
    }
    console.error("Błąd połączenia z Solid.Jobs:", err.cause?.code ?? err);
    throw new HttpError(502, "SOLIDJOBS_ERROR");
  }

  if (!response.ok) {
    console.error("Błąd Solid.Jobs API:", response.status);
    throw new HttpError(502, "SOLIDJOBS_ERROR");
  }
  return response.json();
}

export async function fetchAllJobs() {
  const first = await fetchPage(0);
  const pages = Math.min(first.totalPages ?? 1, MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) => fetchPage(index + 1)),
  );
  return [first, ...rest].flatMap((page) => page.jobs ?? []);
}
