import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { AccordionWidget } from './AccordionWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';

const accordionCustomFields: InspectorField[] = [
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    options: ['single', 'multiple'],
  },
  {
    key: 'collapsible',
    label: 'Collapsible',
    type: 'switch',
  },
  {
    key: 'items',
    label: 'Items',
    type: 'custom',
    component: ({ value, onChange }: { value: any[], onChange: (v: any[]) => void }) => {
      const items = value || [];
      
      const addItem = () => {
        onChange([...items, { value: `item-${items.length + 1}`, title: 'New Item', content: 'Content' }]);
      };
      
      const updateItem = (index: number, field: string, newValue: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: newValue };
        onChange(newItems);
      };
      
      const removeItem = (index: number) => {
        onChange(items.filter((_: any, i: number) => i !== index));
      };
      
      return (
        <div className="space-y-2">
          {items.map((item: any, index: number) => (
            <div key={index} className="border rounded p-2 space-y-2">
              <input
                type="text"
                placeholder="Title"
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                className="w-full p-1 border rounded text-xs"
              />
              <textarea
                placeholder="Content"
                value={item.content}
                onChange={(e) => updateItem(index, 'content', e.target.value)}
                className="w-full p-1 border rounded text-xs"
                rows={2}
              />
              <button
                onClick={() => removeItem(index)}
                className="text-red-500 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full p-1 border border-dashed rounded text-xs"
          >
            Add Item
          </button>
        </div>
      );
    },
  },
];

export const accordionManifest: WidgetConfig = {
  label: 'Accordion',
  category: 'UI',
  description: 'A vertically stacked set of interactive headings that each reveal a section of content.',
  icon: resolveWidgetIcon(undefined, 'UI', 'accordion'),
  tags: ['ui', 'collapsible', 'content'],
  defaults: {
    items: [
      { value: 'item-1', title: 'Is it accessible?', content: 'Yes. It adheres to the WAI-ARIA design pattern.' },
      { value: 'item-2', title: 'Is it styled?', content: 'Yes. It comes with default styles that matches the other components aesthetic.' },
    ],
    type: 'single',
    collapsible: true,
  },
  render: (props) => <AccordionWidget {...(props as any)} />,
  inspector: {
    fields: combineFields(
      accordionCustomFields,
      createInspectorFieldGroups.ui()
    ),
  },
};

