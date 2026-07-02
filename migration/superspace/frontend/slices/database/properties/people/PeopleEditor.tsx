import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';

export const PeopleEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  // Convert array to comma-separated names for editing
  const toInputValue = (val: unknown): string => {
    if (!val) return '';
    if (Array.isArray(val)) {
      return val.map(p => typeof p === 'object' && p !== null && 'name' in p ? p.name : String(p)).join(', ');
    }
    if (typeof val === 'object' && val !== null && 'name' in val) {
      return String(val.name);
    }
    return String(val);
  };

  const [localValue, setLocalValue] = useState(toInputValue(value));

  useEffect(() => {
    setLocalValue(toInputValue(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (!newValue.trim()) {
      onChange([]);
    } else {
      // Convert to array of person objects
      const names = newValue.split(',').map(n => n.trim()).filter(Boolean);
      onChange(names.map(name => ({ name })));
    }
  };

  return (
    <Input
      value={localValue}
      onChange={handleChange}
      placeholder="Enter names (comma-separated)..."
      className="w-full"
    />
  );
};
