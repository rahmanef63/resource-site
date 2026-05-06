import React from 'react';
import { SkeletonCard } from './SkeletonCard';

interface SkeletonListProps {
  count?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
  className?: string;
  itemClassName?: string;
}

export function SkeletonList({ 
  count = 3,
  showHeader = true,
  showFooter = false,
  lines = 3,
  className = '',
  itemClassName = 'mb-4'
}: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={index}
          showHeader={showHeader}
          showFooter={showFooter}
          lines={lines}
          className={itemClassName}
        />
      ))}
    </div>
  );
}