import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthed } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="card">Loading session...</div>;
  }

  if (!isAuthed) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
