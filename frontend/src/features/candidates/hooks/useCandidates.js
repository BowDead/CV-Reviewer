import { useEffect, useState } from "react";
import { fetchCandidates } from "../api/candidatesApi";

export function useCandidates(query) {
  const [state, setState] = useState({
    status: "loading",
    candidates: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchCandidates(query, controller.signal)
      .then(({ candidates }) =>
        setState({ status: "done", candidates, error: null }),
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", candidates: [], error });
      });
    return () => controller.abort();
  }, [query]);

  return state;
}
