import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../api/authApi";

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    status: "loading", // loading | authenticated | anonymous
    user: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchCurrentUser(controller.signal)
      .then(({ user }) => setState({ status: "authenticated", user }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "anonymous", user: null });
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    const { user } = await loginUser(credentials);
    setState({ status: "authenticated", user });
  }, []);

  const register = useCallback(async (data) => {
    const { user } = await registerUser(data);
    setState({ status: "authenticated", user });
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setState({ status: "anonymous", user: null });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
