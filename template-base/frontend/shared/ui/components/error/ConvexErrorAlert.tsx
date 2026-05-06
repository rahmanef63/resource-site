import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

interface ConvexErrorAlertProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ConvexErrorAlert({
  error,
  title = 'Error',
  onRetry,
  onDismiss,
  className
}: ConvexErrorAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const isAuthError = errorMessage.includes('authenticated') || errorMessage.includes('permission');
  const isNetworkError = errorMessage.includes('network') || errorMessage.includes('fetch');

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {title}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{errorMessage}</p>
        
        {isAuthError && (
          <p className="text-sm mb-3">
            Please sign in or check your permissions to continue.
          </p>
        )}
        
        {isNetworkError && (
          <p className="text-sm mb-3">
            Check your internet connection and try again.
          </p>
        )}
        
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
