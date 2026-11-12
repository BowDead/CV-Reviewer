import { useCallback, useEffect, useState } from "react";
import {
  deleteCvFile,
  fetchCvFileContent,
  fetchCvFiles,
} from "../api/cvFilesApi";

export function useCvFiles() {
  const [state, setState] = useState({
    status: "loading",
    files: [],
    error: null,
  });
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchCvFiles(controller.signal)
      .then(({ files }) => setState({ status: "done", files, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", files: [], error });
      });

    return () => controller.abort();
  }, []);

  const load = useCallback(async (file) => {
    setActionError(null);
    try {
      const blob = await fetchCvFileContent(file.id);
      return new File([blob], file.fileName, { type: file.mimeType });
    } catch (error) {
      setActionError(error);
      return null;
    }
  }, []);

  const remove = useCallback(async (id) => {
    setActionError(null);
    try {
      await deleteCvFile(id);
      setState((current) => ({
        ...current,
        files: current.files.filter((file) => file.id !== id),
      }));
      return true;
    } catch (error) {
      setActionError(error);
      return false;
    }
  }, []);

  return { ...state, actionError, load, remove };
}
