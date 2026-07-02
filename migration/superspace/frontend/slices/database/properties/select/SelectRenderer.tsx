import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Badge } from '@/components/ui/badge';

export const SelectRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  const selectValue = String(value);

  return (
    <Badge variant="secondary" className="font-normal">
      {selectValue}
    </Badge>
  );
};
