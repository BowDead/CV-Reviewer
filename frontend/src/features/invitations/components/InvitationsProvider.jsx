import { useMemo } from "react";
import { InvitationsContext } from "../hooks/useInvitations";

export function InvitationsProvider({ feed, basePath, children }) {
  const value = useMemo(() => ({ ...feed, basePath }), [feed, basePath]);

  return (
    <InvitationsContext.Provider value={value}>
      {children}
    </InvitationsContext.Provider>
  );
}
