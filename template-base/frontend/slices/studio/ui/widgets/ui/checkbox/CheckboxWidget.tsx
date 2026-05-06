import React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface CheckboxWidgetProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const CheckboxWidget: React.FC<CheckboxWidgetProps> = ({
  checked = false,
  onCheckedChange,
  label = 'Checkbox label',
  disabled = false,
  className,
}) => {
  const id = React.useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(nextChecked) => onCheckedChange?.(nextChecked === true)}
        disabled={disabled}
      />
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
    </div>
  );
};
