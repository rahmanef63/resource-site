import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonCardProps {
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({ 
  showHeader = true, 
  showFooter = false, 
  lines = 3,
  className = '' 
}: SkeletonCardProps) {
  return (
    <Card className={`animate-pulse ${className}`}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index} 
            className={`h-3 ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`} 
          />
        ))}
      </CardContent>
      {showFooter && (
        <div className="p-6 pt-0">
          <Skeleton className="h-8 w-24" />
        </div>
      )}
    </Card>
  );
}