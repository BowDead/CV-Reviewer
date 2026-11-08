import { useCallback, useEffect, useState } from "react";
import {
  createLlmKey,
  deleteLlmKey,
  fetchLlmKeys,
  updateLlmKeyOrder,
} from "../api/llmKeysApi";

export function useLlmKeys() {
  const [state, setState] = useState({
    status: "loading",
    keys: [],
    providers: [],
    error: null,
  });
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchLlmKeys(controller.signal)
      .then(({ keys, providers }) =>
        setState({ status: "done", keys, providers, error: null }),
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", keys: [], providers: [], error });
      });

    return () => controller.abort();
  }, []);

  const add = useCallback(async (data) => {
    const { key } = await createLlmKey(data);
    setState((current) => ({ ...current, keys: [...current.keys, key] }));
  }, []);

  const remove = useCallback(async (id) => {
    setActionError(null);
    try {
      await deleteLlmKey(id);
      setState((current) => ({
        ...current,
        keys: current.keys.filter((key) => key.id !== id),
      }));
    } catch (error) {
      setActionError(error);
    }
  }, []);

  const reorder = useCallback(async (ids) => {
    setActionError(null);
    try {
      const { keys } = await updateLlmKeyOrder(ids);
      setState((current) => ({ ...current, keys }));
    } catch (error) {
      setActionError(error);
    }
  }, []);

  return { ...state, actionError, add, remove, reorder };
}
