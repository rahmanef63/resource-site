import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AlertWidgetProps {
  variant?: 'default' | 'destructive';
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  className?: string;
}

export const AlertWidget: React.FC<AlertWidgetProps> = ({
  variant = 'default',
  type = 'info',
  title = 'Alert Title',
  description = 'This is an alert description.',
  className,
}) => {
  return (
    <Alert variant={variant} className={className} data-alert-type={type}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};
