import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { AspectRatioWidget } from './AspectRatioWidget';
import React from 'react';
import { RectangleHorizontal } from 'lucide-react';

const aspectRatioInspectorConfig: InspectorField[] = [
  {
    key: 'ratio',
    label: 'Aspect Ratio',
    type: 'select',
    options: ['16/9', '4/3', '1/1', '3/2', '2/1'],
  },
  {
    key: 'backgroundColor',
    label: 'Background Color',
    type: 'text',
    placeholder: 'Custom color (optional)',
  },
];

export const aspectRatioManifest: WidgetConfig = {
  label: 'Aspect Ratio',
  category: 'UI',
  description: 'A container that maintains a specific aspect ratio.',
  icon: RectangleHorizontal,
  tags: ['ui', 'layout', 'container'],
  defaults: {
    ratio: 16/9,
    backgroundColor: undefined,
  },
  render: (props, children) => <AspectRatioWidget {...(props as any)}>{children}</AspectRatioWidget>,
  inspector: {
    fields: aspectRatioInspectorConfig,
  },
};

