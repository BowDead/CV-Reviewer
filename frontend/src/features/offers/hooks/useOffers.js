import { useCallback, useEffect, useState } from "react";
import { fetchOfferInsight, fetchOffers } from "../api/offersApi";

const PAGE_SIZE = 10;

function savedInsights(offers) {
  const insights = {};
  for (const offer of offers) {
    if (offer.insight) {
      insights[offer.offerKey] = { status: "done", ...offer.insight };
    }
  }
  return insights;
}

export function useOffers(analysisId) {
  const [state, setState] = useState({
    status: "loading",
    offers: [],
    error: null,
  });
  const [insights, setInsights] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", offers: [], error: null });
    setInsights({});
    setPage(1);
    fetchOffers(analysisId, controller.signal)
      .then(({ offers }) => {
        setInsights(savedInsights(offers));
        setState({ status: "done", offers, error: null });
      })
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

  const pageCount = Math.ceil(state.offers.length / PAGE_SIZE);
  const pageOffers = state.offers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return {
    ...state,
    insights,
    explain,
    page,
    pageCount,
    pageOffers,
    setPage,
  };
}
