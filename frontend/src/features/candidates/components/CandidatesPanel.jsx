import { useSearchParams } from "react-router";
import { usePositions } from "@/features/positions";
import { CandidateFilters } from "./CandidateFilters";
import { CandidateResults } from "./CandidateResults";
import styles from "./Candidates.module.scss";

function readFilters(searchParams) {
  return {
    positionId: searchParams.get("positionId") ?? "",
    seniority: searchParams.get("seniority") ?? "",
    location: searchParams.get("location") ?? "",
    skillIds: (searchParams.get("skills") ?? "")
      .split(",")
      .filter(Boolean)
      .map(Number),
  };
}

function toSearchParams(filters) {
  const params = {};
  if (filters.positionId) params.positionId = filters.positionId;
  if (filters.seniority) params.seniority = filters.seniority;
  if (filters.location.trim()) params.location = filters.location.trim();
  if (filters.skillIds.length > 0) params.skills = filters.skillIds.join(",");
  return params;
}

export function CandidatesPanel({ renderActions }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { positions } = usePositions();
  const query = searchParams.toString();
  const filters = readFilters(searchParams);

  return (
    <div className={styles.panel}>
      <CandidateFilters
        key={query}
        positions={positions}
        initial={filters}
        onSearch={(next) => setSearchParams(toSearchParams(next))}
      />
      <CandidateResults
        key={`results-${query}`}
        query={query}
        ranked={Boolean(filters.positionId)}
        renderActions={renderActions}
      />
    </div>
  );
}
