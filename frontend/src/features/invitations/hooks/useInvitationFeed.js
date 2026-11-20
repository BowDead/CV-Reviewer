import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchInvitations } from "../api/invitationsApi";
import { useVisibleInterval } from "./useVisibleInterval";

const POLL_MS = 30000;

export function useInvitationFeed() {
  const [state, setState] = useState({
    status: "loading",
    invitations: [],
    error: null,
  });

  const load = useCallback(async (signal) => {
    try {
      const { invitations } = await fetchInvitations(signal);
      setState({ status: "done", invitations, error: null });
    } catch (error) {
      if (error.name === "AbortError") return;
      setState((current) =>
        current.status === "done"
          ? current
          : { status: "error", invitations: [], error },
      );
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useVisibleInterval(load, POLL_MS);

  const markRead = useCallback((invitationId) => {
    setState((current) => {
      const target = current.invitations.find(
        (invitation) => invitation.id === invitationId,
      );
      if (!target?.unread) return current;
      return {
        ...current,
        invitations: current.invitations.map((invitation) =>
          invitation.id === invitationId
            ? { ...invitation, unread: false }
            : invitation,
        ),
      };
    });
  }, []);

  return useMemo(
    () => ({
      ...state,
      unreadCount: state.invitations.filter((invitation) => invitation.unread)
        .length,
      reload: load,
      markRead,
    }),
    [state, load, markRead],
  );
}
