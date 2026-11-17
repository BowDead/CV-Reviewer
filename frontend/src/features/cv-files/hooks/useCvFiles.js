import { useCallback, useEffect, useState } from "react";
import { deleteSavedCv, fetchSavedCv, fetchSavedCvs } from "../api/cvFilesApi";

export function useCvFiles() {
  const [state, setState] = useState({
    status: "loading",
    cvs: [],
    error: null,
  });
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchSavedCvs(controller.signal)
      .then(({ cvs }) => setState({ status: "done", cvs, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", cvs: [], error });
      });

    return () => controller.abort();
  }, []);

  const load = useCallback(async (id) => {
    setActionError(null);
    try {
      return await fetchSavedCv(id);
    } catch (error) {
      setActionError(error);
      return null;
    }
  }, []);

  const remove = useCallback(async (id) => {
    setActionError(null);
    try {
      await deleteSavedCv(id);
      setState((current) => ({
        ...current,
        cvs: current.cvs.filter((cv) => cv.id !== id),
      }));
      return true;
    } catch (error) {
      setActionError(error);
      return false;
    }
  }, []);

  return { ...state, actionError, load, remove };
}
