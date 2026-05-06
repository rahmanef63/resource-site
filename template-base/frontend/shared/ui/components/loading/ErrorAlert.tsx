import React from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  /** Legacy prop - error string or Error object */
  error?: string | Error;
  /** Error title (new API) */
  title?: string;
  /** Error message (new API) */
  message?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  className?: string;
}

export function ErrorAlert({ 
  error, 
  title = 'Error',
  message,
  onRetry, 
  retryText = 'Retry',
  className = '' 
}: ErrorAlertProps) {
  // Support both legacy (error prop) and new (message prop) API
  const errorMessage = message || (typeof error === 'string' ? error : error?.message) || 'An unexpected error occurred';

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <div className="flex items-center justify-between w-full">
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {retryText}
          </Button>
        )}
      </div>
    </Alert>
  );
}