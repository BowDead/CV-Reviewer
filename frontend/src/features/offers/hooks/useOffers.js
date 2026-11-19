import { useEffect, useState } from "react";
import { fetchOffers } from "../api/offersApi";

export function useOffers() {
  const [state, setState] = useState({
    status: "loading",
    offers: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchOffers(controller.signal)
      .then(({ offers }) => setState({ status: "done", offers, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", offers: [], error });
      });
    return () => controller.abort();
  }, []);

  return state;
}
