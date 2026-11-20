import { useCallback, useEffect, useState } from "react";
import {
  fetchThread,
  postMessage,
  respondToInvitation,
} from "../api/invitationsApi";
import { useVisibleInterval } from "./useVisibleInterval";

const POLL_MS = 15000;

export function useThread(invitationId) {
  const [state, setState] = useState({
    status: "loading",
    thread: null,
    error: null,
  });
  const [reload, setReload] = useState({ busy: false, error: null });

  useEffect(() => {
    const controller = new AbortController();
    fetchThread(invitationId, controller.signal)
      .then((thread) => setState({ status: "done", thread, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", thread: null, error });
      });
    return () => controller.abort();
  }, [invitationId]);

  const poll = useCallback(async () => {
    try {
      const thread = await fetchThread(invitationId);
      setState({ status: "done", thread, error: null });
    } catch {
      return;
    }
  }, [invitationId]);

  useVisibleInterval(poll, POLL_MS);

  const refresh = useCallback(async () => {
    setReload({ busy: true, error: null });
    try {
      const thread = await fetchThread(invitationId);
      setState({ status: "done", thread, error: null });
      setReload({ busy: false, error: null });
    } catch (error) {
      setReload({ busy: false, error });
    }
  }, [invitationId]);

  const send = useCallback(
    async (text) => {
      const thread = await postMessage(invitationId, text);
      setState({ status: "done", thread, error: null });
    },
    [invitationId],
  );

  const respond = useCallback(
    async (body) => {
      await respondToInvitation(invitationId, body);
      const thread = await fetchThread(invitationId);
      setState({ status: "done", thread, error: null });
    },
    [invitationId],
  );

  return {
    ...state,
    refreshing: reload.busy,
    refreshError: reload.error,
    refresh,
    send,
    respond,
  };
}
