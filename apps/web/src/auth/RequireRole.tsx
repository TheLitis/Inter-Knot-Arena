import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "@ika/shared";
import { useAuth } from "./AuthProvider";

interface RequireRoleProps {
  roles: Role[];
  children: ReactNode;
  fallback?: string;
}

export function RequireRole({ roles, children, fallback = "/" }: RequireRoleProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="card">Loading access...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  const hasRole = roles.some((role) => user.roles?.includes(role));
  if (!hasRole) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
