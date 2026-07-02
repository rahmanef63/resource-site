import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { UserCog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const LastEditedByRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">Unknown</span>;
  }

  // Handle different value types
  let displayName = '';
  let email = '';

  if (typeof value === 'string') {
    displayName = value;
  } else if (typeof value === 'object' && value !== null) {
    const userObj = value as Record<string, unknown>;
    displayName = String(userObj.name || userObj.displayName || 'Unknown User');
    email = String(userObj.email || '');
  }

  return (
    <div className="flex items-center gap-2">
      <UserCog className="h-3 w-3 text-muted-foreground" />
      <Badge variant="secondary" className="font-normal">
        {displayName}
      </Badge>
      {email && (
        <span className="text-xs text-muted-foreground">{email}</span>
      )}
    </div>
  );
};

export default LastEditedByRenderer;
