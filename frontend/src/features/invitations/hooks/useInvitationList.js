import { useEffect, useState } from "react";
import {
  fetchPositionInvitations,
  fetchReceivedInvitations,
} from "../api/invitationsApi";

export function useInvitationList(positionId) {
  const [state, setState] = useState({
    status: "loading",
    invitations: [],
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const load = positionId
      ? fetchPositionInvitations(positionId, controller.signal)
      : fetchReceivedInvitations(controller.signal);
    load
      .then(({ invitations }) =>
        setState({ status: "done", invitations, error: null }),
      )
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", invitations: [], error });
      });
    return () => controller.abort();
  }, [positionId]);

  return state;
}
