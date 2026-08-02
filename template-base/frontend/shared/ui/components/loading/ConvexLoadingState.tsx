import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ConvexLoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton' | 'overlay';
  skeletonCount?: number;
}

export function ConvexLoadingState({
  message = 'Loading...',
  variant = 'spinner',
  skeletonCount = 3
}: ConvexLoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
