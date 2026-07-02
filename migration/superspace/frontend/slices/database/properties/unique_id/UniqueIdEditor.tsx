import React from 'react';
import { PropertyEditorProps } from '../../registry/types';

export const UniqueIdEditor: React.FC<PropertyEditorProps> = ({ value }) => {
  // Unique ID is auto-generated, not editable
  return (
    <div className="space-y-2 p-2">
      {value ? (
        <div className="text-sm">
          <span className="text-muted-foreground">ID: </span>
          <code className="font-mono bg-muted px-1.5 py-0.5 rounded">
            {String(value)}
          </code>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic">
          ID will be generated automatically
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        Unique IDs are auto-generated and cannot be edited
      </div>
    </div>
  );
};
