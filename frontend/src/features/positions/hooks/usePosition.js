import { useEffect, useState } from "react";
import { fetchPosition } from "../api/positionsApi";

export function usePosition(positionId) {
  const [state, setState] = useState({
    status: positionId ? "loading" : "done",
    position: null,
    error: null,
  });

  useEffect(() => {
    if (!positionId) {
      return undefined;
    }
    const controller = new AbortController();
    fetchPosition(positionId, controller.signal)
      .then((position) => setState({ status: "done", position, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", position: null, error });
      });
    return () => controller.abort();
  }, [positionId]);

  return state;
}
