import React from 'react';
import { ToggleGroup } from '@/components/ui';

interface ToggleGroupWidgetProps {
  type?: 'single' | 'multiple';
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  options?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

export const ToggleGroupWidget: React.FC<ToggleGroupWidgetProps> = ({
  type = 'single',
  value = '',
  onValueChange,
  options = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  size = 'default',
  variant = 'default',
  className,
}) => {
  return (
    <ToggleGroup
      type={type}
      value={value}
      onValueChange={onValueChange}
      options={options}
      size={size}
      variant={variant}
      className={className}
    />
  );
};
