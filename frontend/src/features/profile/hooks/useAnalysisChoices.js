import { useEffect, useState } from "react";
import { fetchAnalyses, fetchSavedCvs } from "../api/profileApi";

export function useAnalysisChoices() {
  const [state, setState] = useState({
    status: "loading",
    analyses: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetchAnalyses(controller.signal),
      fetchSavedCvs(controller.signal),
    ])
      .then(([{ analyses }, { cvs }]) => {
        const names = new Map(cvs.map((cv) => [cv.id, cv.name]));
        setState({
          status: "done",
          analyses: analyses.map((analysis) => ({
            ...analysis,
            cvName: names.get(analysis.cvId) ?? null,
          })),
          error: null,
        });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", analyses: [], error });
      });
    return () => controller.abort();
  }, []);

  return state;
}
