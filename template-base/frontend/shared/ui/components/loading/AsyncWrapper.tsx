import React from 'react';
import { LoadingSpinner, LoadingState } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';

interface AsyncWrapperProps {
  loading: boolean;
  error?: Error | null;
  errorMessage?: string;
  children: React.ReactNode;
  loadingText?: string;
  errorTitle?: string;
  retryAction?: () => void;
  retryText?: string;
  fallback?: React.ReactNode;
  className?: string;
}

export function AsyncWrapper({
  loading,
  error,
  errorMessage,
  children,
  loadingText = 'Loading...',
  errorTitle = 'Error',
  retryAction,
  retryText = 'Try Again',
  fallback = null,
  className = '',
}: AsyncWrapperProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingState message={loadingText} />
      </div>
    );
  }

  if (error || errorMessage) {
    return (
      <div className={`p-4 ${className}`}>
        <ErrorAlert
          title={errorTitle}
          message={errorMessage || error?.message || 'An unexpected error occurred'}
          onRetry={retryAction}
          retryText={retryText}
        />
      </div>
    );
  }

  if (!children && fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}