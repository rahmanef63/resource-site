import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { ScrollAreaWidget } from './ScrollAreaWidget';
import React from 'react';
import { ScrollText } from 'lucide-react';

const scrollAreaInspectorConfig: InspectorField[] = [
  {
    key: 'type',
    label: 'Scroll Type',
    type: 'select',
    options: ['auto', 'always', 'scroll', 'hover'],
  },
  {
    key: 'height',
    label: 'Height',
    type: 'text',
    placeholder: '200px',
  },
];

export const scrollAreaManifest: WidgetConfig = {
  label: 'Scroll Area',
  category: 'UI',
  description: 'Augments native scroll functionality for custom, cross-browser styling.',
  icon: ScrollText,
  tags: ['ui', 'scroll', 'container'],
  defaults: {
    type: 'auto',
    height: '200px',
  },
  render: (props, children) => <ScrollAreaWidget {...(props as any)}>{children}</ScrollAreaWidget>,
  inspector: {
    fields: scrollAreaInspectorConfig,
  },
};

