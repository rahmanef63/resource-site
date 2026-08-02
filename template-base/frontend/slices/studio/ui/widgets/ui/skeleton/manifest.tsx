import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { SkeletonWidget } from './SkeletonWidget';
import React from 'react';
import { Square } from 'lucide-react';

const skeletonInspectorConfig: InspectorField[] = [
  {
    key: 'variant',
    label: 'Variant',
    type: 'select',
    options: ['text', 'circular', 'rectangular'],
  },
  {
    key: 'width',
    label: 'Width',
    type: 'text',
    placeholder: '100% or 200px',
  },
  {
    key: 'height',
    label: 'Height',
    type: 'text',
    placeholder: '20px',
  },
];

export const skeletonManifest: WidgetConfig = {
  label: 'Skeleton',
  category: 'UI',
  description: 'Used to provide a visual loading indicator.',
  icon: Square,
  tags: ['ui', 'loading', 'placeholder'],
  defaults: {
    variant: 'rectangular',
    width: '100%',
    height: 20,
  },
  render: (props) => <SkeletonWidget {...(props as any)} />,
  inspector: {
    fields: skeletonInspectorConfig,
  },
};

