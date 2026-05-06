import type { WidgetConfig, InspectorField } from '@/frontend/slices/studio/ui/types';
import { AlertWidget } from './AlertWidget';
import React from 'react';
import { AlertCircle } from 'lucide-react';

const alertInspectorConfig: InspectorField[] = [
  {
    key: 'variant',
    label: 'Variant',
    type: 'select',
    options: ['default', 'destructive'],
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    options: ['info', 'success', 'warning', 'error'],
  },
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Alert title',
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Alert description',
  },
];

export const alertManifest: WidgetConfig = {
  label: 'Alert',
  category: 'UI',
  description: 'Displays a callout for user attention.',
  icon: AlertCircle,
  tags: ['ui', 'notification', 'message'],
  defaults: {
    variant: 'default',
    type: 'info',
    title: 'Alert Title',
    description: 'This is an alert description.',
  },
  render: (props) => <AlertWidget {...(props as any)} />,
  inspector: {
    fields: alertInspectorConfig,
  },
};

