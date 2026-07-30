import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../lib/store";
import type { UserRole } from "../../types/models";

/**
 * Client-side route gate. Swap the `useAuth` source for a real session check
 * once the backend issues JWTs — the rest of the tree stays unchanged.
 */
export function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (user.role !== role) {
      navigate({ to: user.role === "admin" ? "/admin" : "/dashboard", replace: true });
    }
  }, [ready, user, role, navigate]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground" role="status" aria-live="polite">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your access…
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
