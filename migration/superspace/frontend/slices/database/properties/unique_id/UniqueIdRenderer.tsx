import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Hash } from 'lucide-react';

export const UniqueIdRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Auto-generated</span>;
  }

  const idValue = String(value);

  return (
    <div className="flex items-center gap-2">
      <Hash className="h-3 w-3 text-muted-foreground" />
      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
        {idValue}
      </code>
    </div>
  );
};
