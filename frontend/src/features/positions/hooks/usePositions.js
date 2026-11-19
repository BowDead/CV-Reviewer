import { useCallback, useEffect, useState } from "react";
import { deletePosition, fetchPositions } from "../api/positionsApi";

export function usePositions() {
  const [state, setState] = useState({
    status: "loading",
    positions: [],
    error: null,
  });
  const [removeError, setRemoveError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPositions(controller.signal)
      .then(({ positions }) =>
        setState({ status: "done", positions, error: null }),
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", positions: [], error });
      });
    return () => controller.abort();
  }, []);

  const remove = useCallback(async (positionId) => {
    setRemoveError(null);
    try {
      await deletePosition(positionId);
      setState((current) => ({
        ...current,
        positions: current.positions.filter(
          (position) => position.id !== positionId,
        ),
      }));
    } catch (error) {
      setRemoveError(error);
    }
  }, []);

  return { ...state, remove, removeError };
}
