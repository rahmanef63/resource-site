import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Badge } from '@/components/ui/badge';

export const MultiSelectRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  // Handle array or comma-separated string
  const items = Array.isArray(value) 
    ? value 
    : String(value).split(',').map(v => v.trim()).filter(Boolean);

  if (items.length === 0) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary" className="font-normal">
          {String(item)}
        </Badge>
      ))}
    </div>
  );
};
