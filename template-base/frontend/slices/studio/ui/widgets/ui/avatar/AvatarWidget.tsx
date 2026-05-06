import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarWidgetProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarWidget: React.FC<AvatarWidgetProps> = ({
  src = '',
  alt = 'Avatar',
  fallback = 'CN',
  size = 'md',
  className,
}) => {
  const sizeClass =
    size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';

  return (
    <Avatar className={cn(sizeClass, className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
};
