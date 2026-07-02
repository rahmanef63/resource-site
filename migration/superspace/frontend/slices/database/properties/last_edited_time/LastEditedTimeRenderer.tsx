import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Clock } from 'lucide-react';

export const LastEditedTimeRenderer: React.FC<PropertyRendererProps<number>> = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Never edited</span>;
  }

  try {
    const timestamp = typeof value === 'number' ? value : new Date(String(value)).getTime();
    const date = new Date(timestamp);
    
    // Relative time (e.g., "2 minutes ago")
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let relativeTime = '';
    if (days > 0) {
      relativeTime = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      relativeTime = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      relativeTime = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      relativeTime = 'Just now';
    }

    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">{relativeTime}</span>
      </div>
    );
  } catch {
    return <span className="text-destructive text-xs">Invalid timestamp</span>;
  }
};

export default LastEditedTimeRenderer;
