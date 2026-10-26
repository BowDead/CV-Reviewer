import { useCallback, useRef, useState } from "react";
import { analyzeCv } from "../api/cvAnalysisApi";

const initialState = {
  status: "idle", // idle | loading | done | error
  analyzedText: null,
  result: null,
  error: null,
};

export function useCvAnalysis() {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef(null);

  const analyze = useCallback(async (text) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({
      status: "loading",
      analyzedText: text,
      result: null,
      error: null,
    });

    try {
      const result = await analyzeCv(text, controller.signal);
      setState({ status: "done", analyzedText: text, result, error: null });
    } catch (error) {
      if (error.name === "AbortError") return;
      setState({ status: "error", analyzedText: text, result: null, error });
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState(initialState);
  }, []);

  return { ...state, analyze, reset };
}
