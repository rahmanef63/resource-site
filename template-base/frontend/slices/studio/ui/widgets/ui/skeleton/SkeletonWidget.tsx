import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonWidgetProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const SkeletonWidget: React.FC<SkeletonWidgetProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  className,
}) => {
  const shapeClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
        ? 'h-4 rounded'
        : 'rounded-md';

  return (
    <Skeleton className={cn(shapeClass, className)} style={{ width, height }} />
  );
};
