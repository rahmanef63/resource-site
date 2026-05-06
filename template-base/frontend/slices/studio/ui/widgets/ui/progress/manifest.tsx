import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { ProgressWidget } from './ProgressWidget';
import React from 'react';
import { BarChart3 } from 'lucide-react';

const progressInspectorConfig: InspectorField[] = [
  {
    key: 'value',
    label: 'Value',
    type: 'number',
    placeholder: '50',
  },
  {
    key: 'max',
    label: 'Maximum',
    type: 'number',
    placeholder: '100',
  },
  {
    key: 'showValue',
    label: 'Show Value',
    type: 'switch',
  },
];

export const progressManifest: WidgetConfig = {
  label: 'Progress',
  category: 'UI',
  description: 'Displays an indicator showing the completion progress of a task.',
  icon: BarChart3,
  tags: ['ui', 'progress', 'indicator'],
  defaults: {
    value: 50,
    max: 100,
    showValue: false,
  },
  render: (props) => <ProgressWidget {...(props as any)} />,
  inspector: {
    fields: progressInspectorConfig,
  },
};

