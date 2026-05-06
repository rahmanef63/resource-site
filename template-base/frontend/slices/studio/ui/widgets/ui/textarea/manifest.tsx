import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { TextareaWidget } from './TextareaWidget';
import React from 'react';
import { FileText } from 'lucide-react';

const textareaInspectorConfig: InspectorField[] = [
  {
    key: 'placeholder',
    label: 'Placeholder',
    type: 'text',
    placeholder: 'Enter placeholder text',
  },
  {
    key: 'rows',
    label: 'Rows',
    type: 'number',
    placeholder: '3',
  },
  {
    key: 'disabled',
    label: 'Disabled',
    type: 'switch',
  },
];

export const textareaManifest: WidgetConfig = {
  label: 'Textarea',
  category: 'Form',
  description: 'A multi-line text input control.',
  icon: FileText,
  tags: ['ui', 'form', 'input', 'text'],
  defaults: {
    value: '',
    placeholder: 'Enter text...',
    rows: 3,
    disabled: false,
  },
  render: (props) => <TextareaWidget {...(props as any)} />,
  inspector: {
    fields: textareaInspectorConfig,
  },
};

