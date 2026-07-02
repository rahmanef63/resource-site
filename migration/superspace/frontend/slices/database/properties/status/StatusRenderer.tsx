import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Badge } from '@/components/ui/badge';

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  'not started': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  'in progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'blocked': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  'on hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  'cancelled': 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export const StatusRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">No status</span>;
  }

  const statusValue = String(value).toLowerCase();
  const colorClass = STATUS_COLORS[statusValue] || 'bg-secondary text-secondary-foreground';

  return (
    <Badge className={`${colorClass} font-normal`}>
      {String(value)}
    </Badge>
  );
};
