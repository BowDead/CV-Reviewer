import { useCallback, useEffect, useState } from "react";
import { fetchOffer, fetchOfferInsight } from "../api/offersApi";

export function useOfferDetails(offerKey) {
  const [state, setState] = useState({
    status: "loading",
    offer: null,
    error: null,
  });
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchOffer(offerKey, controller.signal)
      .then((offer) => {
        setState({ status: "done", offer, error: null });
        setInsight(offer.insight ? { status: "done", ...offer.insight } : null);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", offer: null, error });
      });
    return () => controller.abort();
  }, [offerKey]);

  const explain = useCallback(async () => {
    setInsight({ status: "loading" });
    try {
      const result = await fetchOfferInsight(offerKey);
      setInsight({ status: "done", ...result });
    } catch (error) {
      setInsight({ status: "error", error });
    }
  }, [offerKey]);

  return { ...state, insight, explain };
}
