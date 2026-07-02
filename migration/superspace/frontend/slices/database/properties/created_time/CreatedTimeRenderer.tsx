import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Clock } from 'lucide-react';

export const CreatedTimeRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Not set</span>;
  }

  try {
    const date = new Date(String(value));
    if (isNaN(date.getTime())) {
      return <span className="text-destructive">Invalid date</span>;
    }

    // Format with date and time
    const formatted = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

    // Calculate relative time
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let relative = '';
    if (days > 0) relative = `${days}d ago`;
    else if (hours > 0) relative = `${hours}h ago`;
    else if (minutes > 0) relative = `${minutes}m ago`;
    else relative = 'just now';

    return (
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm" title={formatted}>
          {relative}
        </span>
      </div>
    );
  } catch {
    return <span className="text-destructive">Invalid date</span>;
  }
};
