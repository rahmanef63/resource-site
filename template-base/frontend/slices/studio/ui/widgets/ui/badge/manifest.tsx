import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { BadgeWidget } from './BadgeWidget';
import { createCustomField, createInspectorFieldGroups, combineFields } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { resolveWidgetIcon } from '@/frontend/slices/studio/ui/utils/iconUtils';
import React from 'react';



export const badgeManifest: WidgetConfig = {
  label: 'Badge',
  category: 'UI',
  description: 'Displays a small amount of information.',
  icon: resolveWidgetIcon(undefined, 'UI', 'badge'),
  tags: ['ui', 'status', 'label'],
  defaults: {
    children: 'Badge',
    variant: 'default',
  },
  render: (props) => <BadgeWidget {...(props as any)} />,
  inspector: {
    fields: combineFields(
      [
        createCustomField({
          key: 'children',
          label: 'Text',
          type: 'text',
          placeholder: 'Badge text',
        }),
        createCustomField({
          key: 'variant',
          label: 'Variant',
          type: 'select',
          options: ['default', 'secondary', 'destructive', 'outline'],
        }),
      ],
      createInspectorFieldGroups.ui()
    )
  },
};

