import React from 'react';
import { Badge } from '@/components/ui';

interface BadgeWidgetProps {
  children?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const BadgeWidget: React.FC<BadgeWidgetProps> = ({
  children = 'Badge',
  variant = 'default',
  className,
}) => {
  return (
    <Badge variant={variant} className={className}>
      {children}
    </Badge>
  );
};
