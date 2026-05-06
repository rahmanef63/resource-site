import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TextareaWidgetProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export const TextareaWidget: React.FC<TextareaWidgetProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  rows = 3,
  disabled = false,
  className,
}) => {
  return (
    <Textarea
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={className}
    />
  );
};
