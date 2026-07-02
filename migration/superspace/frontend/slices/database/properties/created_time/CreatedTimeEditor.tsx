import React from 'react';
import { PropertyEditorProps } from '../../registry/types';

export const CreatedTimeEditor: React.FC<PropertyEditorProps> = ({ value }) => {
  // Created time is auto-generated, not editable
  
  if (!value) {
    return (
      <div className="text-sm text-muted-foreground italic p-2">
        Timestamp will be set automatically when record is created
      </div>
    );
  }

  try {
    const date = new Date(String(value));
    if (isNaN(date.getTime())) {
      return <div className="text-sm text-destructive p-2">Invalid timestamp</div>;
    }

    const formatted = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);

    return (
      <div className="space-y-2 p-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Created: </span>
          <span className="font-medium">{formatted}</span>
        </div>
        <div className="text-xs text-muted-foreground italic">
          Created time is auto-generated and cannot be edited
        </div>
      </div>
    );
  } catch {
    return <div className="text-sm text-destructive p-2">Invalid timestamp</div>;
  }
};
