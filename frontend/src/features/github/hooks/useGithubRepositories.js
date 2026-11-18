import { useCallback, useEffect, useState } from "react";
import {
  analyzeRepositories,
  deleteGithubAccount,
  fetchRepositories,
  saveGithubLogin,
} from "../api/githubApi";

export function useGithubRepositories() {
  const [state, setState] = useState({
    status: "loading",
    login: null,
    repositories: [],
    error: null,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [actionError, setActionError] = useState(null);

  const reload = useCallback(async (signal) => {
    try {
      const { login, repositories } = await fetchRepositories(signal);
      setState({ status: "done", login, repositories, error: null });
    } catch (error) {
      if (error.name === "AbortError") return;
      setState((current) => ({ ...current, status: "error", error }));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    reload(controller.signal);
    return () => controller.abort();
  }, [reload]);

  const saveLogin = useCallback(
    async (login) => {
      await saveGithubLogin(login);
      setLastRun(null);
      await reload();
    },
    [reload],
  );

  const removeAccount = useCallback(async () => {
    setActionError(null);
    try {
      await deleteGithubAccount();
      setLastRun(null);
      setState({ status: "done", login: null, repositories: [], error: null });
    } catch (error) {
      setActionError(error);
    }
  }, []);

  const analyze = useCallback(async () => {
    setAnalyzing(true);
    setActionError(null);
    try {
      const { analyzed, unchanged, failed, remaining, login, repositories } =
        await analyzeRepositories();
      setLastRun({ analyzed, unchanged, failed, remaining });
      setState({ status: "done", login, repositories, error: null });
    } catch (error) {
      setActionError(error);
      await reload();
    } finally {
      setAnalyzing(false);
    }
  }, [reload]);

  return {
    ...state,
    analyzing,
    lastRun,
    actionError,
    saveLogin,
    removeAccount,
    analyze,
  };
}
