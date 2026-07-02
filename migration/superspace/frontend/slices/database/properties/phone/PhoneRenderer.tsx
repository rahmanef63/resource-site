import React from 'react';
import { PropertyRendererProps } from '../../registry/types';
import { Phone as PhoneIcon } from 'lucide-react';

export const PhoneRenderer: React.FC<PropertyRendererProps> = ({ value }) => {
  if (!value) {
    return <span className="text-muted-foreground italic">Empty</span>;
  }

  const phoneValue = String(value);

  return (
    <a
      href={`tel:${phoneValue}`}
      className="flex items-center gap-2 text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      <PhoneIcon className="h-3 w-3" />
      <span className="text-sm">{phoneValue}</span>
    </a>
  );
};
