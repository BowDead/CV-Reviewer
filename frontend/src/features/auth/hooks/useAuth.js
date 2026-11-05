import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth musi być użyty wewnątrz <AuthProvider>.");
  }
  return auth;
}
