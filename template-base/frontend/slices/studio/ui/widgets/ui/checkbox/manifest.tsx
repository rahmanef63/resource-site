import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { CheckboxWidget } from './CheckboxWidget';
import React from 'react';
import { CheckSquare } from 'lucide-react';

const checkboxInspectorConfig: InspectorField[] = [
  {
    key: 'label',
    label: 'Label',
    type: 'text',
    placeholder: 'Checkbox label',
  },
  {
    key: 'checked',
    label: 'Checked',
    type: 'switch',
  },
  {
    key: 'disabled',
    label: 'Disabled',
    type: 'switch',
  },
];

export const checkboxManifest: WidgetConfig = {
  label: 'Checkbox',
  category: 'Form',
  description: 'A control that allows the user to select a binary "checked" state.',
  icon: CheckSquare,
  tags: ['ui', 'form', 'input'],
  defaults: {
    checked: false,
    label: 'Checkbox label',
    disabled: false,
  },
  render: (props) => <CheckboxWidget {...(props as any)} />,
  inspector: {
    fields: checkboxInspectorConfig,
  },
};

