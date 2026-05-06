import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RadioGroupWidgetProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  className?: string;
}

export const RadioGroupWidget: React.FC<RadioGroupWidgetProps> = ({
  value = '',
  onValueChange,
  options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  className,
}) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {options.map((option) => (
        <div key={option.value} className={cn('flex items-center space-x-2', option.disabled && 'opacity-50')}>
          <RadioGroupItem
            value={option.value}
            id={`radio-${option.value}`}
            disabled={option.disabled}
          />
          <Label htmlFor={`radio-${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
};
