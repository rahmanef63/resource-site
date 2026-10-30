import React from 'react';
import { ToggleGroup as UiToggleGroup, ToggleGroupItem } from '@/components/ui';

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

/** Radix drives toggle items through children; `options` is this widget's own
 *  convenience shape. `onValueChange` also narrows to string on single. */
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
  const items = options.map((option) => (
    <ToggleGroupItem key={option.value} value={option.value} aria-label={option.label}>
      {option.icon}
      {option.label}
    </ToggleGroupItem>
  ));

  return type === 'single' ? (
    <UiToggleGroup
      type="single"
      value={typeof value === 'string' ? value : ''}
      onValueChange={(next) => onValueChange?.(next)}
      size={size}
      variant={variant}
      className={className}
    >
      {items}
    </UiToggleGroup>
  ) : (
    <UiToggleGroup
      type="multiple"
      value={Array.isArray(value) ? value : []}
      onValueChange={(next) => onValueChange?.(next)}
      size={size}
      variant={variant}
      className={className}
    >
      {items}
    </UiToggleGroup>
  );
};
