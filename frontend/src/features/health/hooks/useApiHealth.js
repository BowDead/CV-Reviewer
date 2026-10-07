import { useEffect, useState } from "react";
import { fetchHealth } from "../api/healthApi";

export function useApiHealth() {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchHealth(controller.signal)
      .then((data) => setState({ loading: false, data, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ loading: false, data: null, error });
      });

    return () => controller.abort();
  }, []);

  return state;
}
