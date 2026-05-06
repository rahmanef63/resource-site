import React from 'react';
import { Label, Toggle } from '@/components/ui';
import { Italic, Underline, Strikethrough } from 'lucide-react';

interface ToggleGroupControlProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

const iconMap = {
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough
};

export function ToggleGroupControl({
  label,
  value = [],
  onChange,
  options
}: ToggleGroupControlProps) {
  const handleToggle = (option: string, pressed: boolean) => {
    if (pressed) {
      onChange([...value, option]);
    } else {
      onChange(value.filter(v => v !== option));
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1 justify-between">
        {options.map(option => {
          const Icon = iconMap[option as keyof typeof iconMap];
          return (
            <Toggle
              key={option}
              pressed={value.includes(option)}
              onPressedChange={(pressed: boolean) => handleToggle(option, pressed)}
              size="sm"
            >
              {Icon ? <Icon size={14} /> : option}
            </Toggle>
          );
        })}
      </div>
    </div>
  );
}
