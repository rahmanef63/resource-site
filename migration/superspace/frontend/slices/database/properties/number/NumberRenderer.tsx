import React from 'react';
import { PropertyRendererProps } from '../../registry/types';

export const NumberRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  const numValue = Number(value);

  if (isNaN(numValue)) {
    return <span className="text-destructive">Invalid number</span>;
  }

  // Format with locale-specific separators
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 10,
  }).format(numValue);

  return (
    <span className="font-mono text-sm">
      {formatted}
    </span>
  );
};
