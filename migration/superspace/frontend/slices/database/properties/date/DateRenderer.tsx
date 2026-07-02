import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Calendar } from 'lucide-react';

export const DateRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  try {
    const date = new Date(String(value));
    if (isNaN(date.getTime())) {
      return <span className="text-destructive">Invalid date</span>;
    }

    const formatted = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);

    return (
      <div className="flex items-center gap-2">
        <Calendar className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm">{formatted}</span>
      </div>
    );
  } catch {
    return <span className="text-destructive">Invalid date</span>;
  }
};
