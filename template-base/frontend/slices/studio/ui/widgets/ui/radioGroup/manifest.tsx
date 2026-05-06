import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { RadioGroupWidget } from './RadioGroupWidget';
import React from 'react';
import { Circle } from 'lucide-react';

const radioGroupInspectorConfig: InspectorField[] = [
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

export const radioGroupManifest: WidgetConfig = {
  label: 'Radio Group',
  category: 'Form',
  description: 'A set of checkable buttonsâ€”known as radio buttonsâ€”where no more than one of the buttons can be checked at a time.',
  icon: Circle,
  tags: ['ui', 'form', 'input', 'radio'],
  defaults: {
    value: '',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
  render: (props) => <RadioGroupWidget {...(props as any)} />,
  inspector: {
    fields: radioGroupInspectorConfig,
  },
};

