import { createContext, useContext } from "react";

export const InvitationsContext = createContext(null);

export function useInvitations() {
  const invitations = useContext(InvitationsContext);
  if (!invitations) {
    throw new Error(
      "useInvitations musi być użyte wewnątrz InvitationsProvider",
    );
  }
  return invitations;
}
