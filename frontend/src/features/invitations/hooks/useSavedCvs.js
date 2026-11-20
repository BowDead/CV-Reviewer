import { useEffect, useState } from "react";
import { fetchSavedCvs } from "../api/invitationsApi";

export function useSavedCvs() {
  const [cvs, setCvs] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchSavedCvs(controller.signal)
      .then((data) => setCvs(data.cvs))
      .catch((error) => {
        if (error.name !== "AbortError") setCvs([]);
      });
    return () => controller.abort();
  }, []);

  return cvs;
}
