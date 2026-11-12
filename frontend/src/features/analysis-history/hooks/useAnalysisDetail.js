import { useEffect, useState } from "react";
import { fetchAnalysis } from "../api/analysisHistoryApi";

const loadingState = { status: "loading", analysis: null, error: null };

export function useAnalysisDetail(id) {
  const [state, setState] = useState({ id: null, ...loadingState });

  useEffect(() => {
    const controller = new AbortController();

    fetchAnalysis(id, controller.signal)
      .then((analysis) =>
        setState({ id, status: "done", analysis, error: null }),
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ id, status: "error", analysis: null, error });
      });

    return () => controller.abort();
  }, [id]);

  return state.id === id ? state : loadingState;
}
