import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { ToggleGroupWidget } from './ToggleGroupWidget';
import React from 'react';
import { ToggleLeft } from 'lucide-react';

const toggleGroupInspectorConfig: InspectorField[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    options: ['single', 'multiple'],
  },
  {
    key: 'size',
    label: 'Size',
    type: 'select',
    options: ['sm', 'default', 'lg'],
  },
  {
    key: 'variant',
    label: 'Variant',
    type: 'select',
    options: ['default', 'outline'],
  },
  {
    key: 'options',
    label: 'Options',
    type: 'custom',
    component: ({ value, onChange }: { value: any[], onChange: (v: any[]) => void }) => {
      const options = value || [];
      
      const addOption = () => {
        onChange([...options, { value: `option${options.length + 1}`, label: 'New Option' }]);
      };
      
      const updateOption = (index: number, field: string, newValue: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: newValue };
        onChange(newOptions);
      };
      
      const removeOption = (index: number) => {
        onChange(options.filter((_: any, i: number) => i !== index));
      };
      
      return (
        <div className="space-y-2">
          {options.map((option: any, index: number) => (
            <div key={index} className="border rounded p-2 space-y-2">
              <input
                type="text"
                placeholder="Value"
                value={option.value}
                onChange={(e) => updateOption(index, 'value', e.target.value)}
                className="w-full p-1 border rounded text-xs"
              />
              <input
                type="text"
                placeholder="Label"
                value={option.label}
                onChange={(e) => updateOption(index, 'label', e.target.value)}
                className="w-full p-1 border rounded text-xs"
              />
              <button
                onClick={() => removeOption(index)}
                className="text-red-500 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="w-full p-1 border border-dashed rounded text-xs"
          >
            Add Option
          </button>
        </div>
      );
    },
  },
];

export const toggleGroupManifest: WidgetConfig = {
  label: 'Toggle Group',
  category: 'UI',
  description: 'A set of two-state buttons that can be toggled on or off.',
  icon: ToggleLeft,
  tags: ['ui', 'toggle', 'group', 'selection'],
  defaults: {
    type: 'single',
    value: '',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
    size: 'default',
    variant: 'default',
  },
  render: (props) => <ToggleGroupWidget {...(props as any)} />,
  inspector: {
    fields: toggleGroupInspectorConfig,
  },
};

