import { useCallback, useEffect, useState } from "react";
import { deleteAnalysis, fetchAnalyses } from "../api/analysisHistoryApi";

export function useAnalysisHistory() {
  const [state, setState] = useState({
    status: "loading",
    analyses: [],
    error: null,
  });
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchAnalyses(controller.signal)
      .then(({ analyses }) =>
        setState({ status: "done", analyses, error: null }),
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", analyses: [], error });
      });

    return () => controller.abort();
  }, []);

  const remove = useCallback(async (id) => {
    setActionError(null);
    try {
      await deleteAnalysis(id);
      setState((current) => ({
        ...current,
        analyses: current.analyses.filter((analysis) => analysis.id !== id),
      }));
    } catch (error) {
      setActionError(error);
    }
  }, []);

  return { ...state, actionError, remove };
}
