import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';

// Common status options
const STATUS_OPTIONS = [
  'Not Started',
  'In Progress',
  'Completed',
  'Blocked',
  'On Hold',
  'Cancelled',
];

export const StatusEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value ? String(value) : '');

  useEffect(() => {
    setLocalValue(value ? String(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue || null);
  };

  const handleSelectOption = (option: string) => {
    setLocalValue(option);
    onChange(option);
  };

  return (
    <div className="space-y-2">
      <Input
        value={localValue}
        onChange={handleChange}
        placeholder="Enter status..."
        className="w-full"
        list="status-options"
      />
      <datalist id="status-options">
        {STATUS_OPTIONS.map(option => (
          <option key={option} value={option} />
        ))}
      </datalist>
      <div className="flex flex-wrap gap-1">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelectOption(option)}
            className="text-xs px-2 py-1 rounded border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
