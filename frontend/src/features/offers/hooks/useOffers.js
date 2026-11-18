import { useCallback, useEffect, useState } from "react";
import { fetchOfferInsight, fetchOffers } from "../api/offersApi";

export function useOffers(analysisId) {
  const [state, setState] = useState({
    status: "loading",
    offers: [],
    error: null,
  });
  const [insights, setInsights] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", offers: [], error: null });
    setInsights({});
    fetchOffers(analysisId, controller.signal)
      .then(({ offers }) => setState({ status: "done", offers, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", offers: [], error });
      });
    return () => controller.abort();
  }, [analysisId]);

  const explain = useCallback(
    async (offerKey) => {
      setInsights((current) => ({
        ...current,
        [offerKey]: { status: "loading" },
      }));
      try {
        const insight = await fetchOfferInsight(offerKey, analysisId);
        setInsights((current) => ({
          ...current,
          [offerKey]: { status: "done", ...insight },
        }));
      } catch (error) {
        setInsights((current) => ({
          ...current,
          [offerKey]: { status: "error", error },
        }));
      }
    },
    [analysisId],
  );

  return { ...state, insights, explain };
}
