import { useEffect, useState } from "react";
import { fetchOfferRepositories } from "../api/offersApi";

export function useOfferRepositories(offerKey, enabled, version) {
  const [state, setState] = useState({
    status: "loading",
    repositories: [],
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const controller = new AbortController();
    fetchOfferRepositories(offerKey, controller.signal)
      .then(({ repositories }) =>
        setState({ status: "done", repositories, error: null }),
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", repositories: [], error });
      });
    return () => controller.abort();
  }, [offerKey, enabled, version]);

  return state;
}
