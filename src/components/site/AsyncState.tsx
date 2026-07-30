import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingState({ label = "Loading…", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {label}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="glass rounded-3xl p-8 text-center" role="alert">
      <AlertTriangle className="h-8 w-8 mx-auto text-orange" />
      <div className="mt-3 font-semibold">Something went wrong</div>
      <p className="mt-1 text-sm text-muted-foreground">{message ?? "We couldn't load this data."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 glass hover:bg-white/15 text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="glass rounded-3xl p-10 text-center">
      <Inbox className="h-8 w-8 mx-auto text-muted-foreground" />
      <div className="mt-3 font-semibold">{title}</div>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Renders the right state for any API-backed list/detail query. */
export function AsyncBoundary<T>({
  isLoading,
  error,
  data,
  onRetry,
  loadingLabel,
  empty,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  onRetry?: () => void;
  loadingLabel?: string;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  if (isLoading) return <LoadingState label={loadingLabel} />;
  if (error) return <ErrorState message={(error as Error)?.message} onRetry={onRetry} />;
  if (data === undefined || data === null) return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  if (Array.isArray(data) && data.length === 0) return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;
  return <>{children(data)}</>;
}
