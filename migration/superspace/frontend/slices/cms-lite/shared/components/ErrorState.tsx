/**
 * Slice-local ErrorState — kept intentionally (NOT migrated to shared/ui).
 *
 * @dod:dup-eliminate Shared `ErrorAlert` (frontend/shared/ui/components/loading/ErrorAlert)
 * is an inline `<Alert>` variant — visually a small banner. This component is a
 * full-screen centered card (min-h-[400px]) used by cms-lite admin pages as a
 * page-level error state. Different visual contract → keep slice-local until
 * a `PageErrorState` canonical primitive lands in shared/ui/error/.
 */
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "An error occurred while loading data. Please try again.",
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-foreground/70 mb-6">{message}</p>
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
