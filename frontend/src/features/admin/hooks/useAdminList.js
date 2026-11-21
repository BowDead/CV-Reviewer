import { useCallback, useEffect, useState } from "react";

export function useAdminList(load) {
  const [state, setState] = useState({
    status: "loading",
    items: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((items) => setState({ status: "done", items, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", items: [], error });
      });
    return () => controller.abort();
  }, [load]);

  const replace = useCallback((item) => {
    setState((current) => ({
      ...current,
      items: current.items.map((existing) =>
        existing.id === item.id ? item : existing,
      ),
    }));
  }, []);

  const prepend = useCallback((item) => {
    setState((current) => ({ ...current, items: [item, ...current.items] }));
  }, []);

  return { ...state, replace, prepend };
}
