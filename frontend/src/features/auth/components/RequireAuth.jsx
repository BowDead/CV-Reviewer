import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { homePathFor } from "../constants";

export function RequireAuth({ roles, children }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <p>Sprawdzanie sesji…</p>;
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return children;
}
