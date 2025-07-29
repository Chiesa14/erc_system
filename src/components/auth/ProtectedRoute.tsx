import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated → go to login
        if (location.pathname !== "/login") {
          navigate("/login", { state: { from: location }, replace: true });
        }
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Authenticated but not authorized → redirect based on role
        const roleRoutes: Record<string, string> = {
          admin: "/admin",
          Père: "/parent",
          Mère: "/parent",
          Other: "/youth",
        };

        const fallbackRoute = roleRoutes[user.role] || "/youth";

        // Check if the current path starts with the fallback route
        if (!location.pathname.startsWith(fallbackRoute)) {
          navigate(fallbackRoute, { replace: true });
        }
      }
    }
  }, [user, loading, allowedRoles, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null; // Already redirected
  }

  return <>{children}</>;
}
